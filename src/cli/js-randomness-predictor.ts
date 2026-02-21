#!/usr/bin/env node

import nodefs from "node:fs";
import nodepath from "node:path";
import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { NodeJsMajorVersion, Predictor, PredictorArgs, PredictorResult } from "../types.js";
import Logger from "../logger.js";
import {
  RUNTIMES,
  NODE_MAJOR_VERSIONS,
  DEFAULT_NUMBER_OF_PREDICTIONS,
  DEFAULT_SEQUENCE_LENGTH,
  EXECUTION_RUNTIME_ENV_VAR_KEY,
  RUNTIME_ENGINE,
  V8_MAX_PREDICTIONS,
} from "../constants.js";
import callMathRandom from "../callMathRandom.js";
import { SequenceNotFoundError } from "../errors.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import JSRandomnessPredictor from "../index.js";

/**
 * The `yargs` command
 */
const predictCommand: CommandModule = {
  command: "*",
  describe: "Predict future Math.random() values",
  builder: (yargs) => {
    return yargs
      .option("environment", {
        alias: "e",
        describe: "Predictor environment",
        choices: RUNTIMES,
        demandOption: true,
        type: "string",
      })
      .option("sequence", {
        alias: "s",
        describe: "Observed sequence",
        type: "array",
        coerce: (arr: number[]) => {
          return arr.map((v) => {
            const n = Number(v);
            if (isNaN(n)) {
              throw new Error(`Invalid number in sequence: ${v}`);
            }
            return n;
          });
        },
      })
      .option("predictions", {
        alias: "p",
        describe: "Number of predictions",
        type: "number",
        default: 10,
        coerce: (numPredictions: number) => {
          if (numPredictions <= 0) {
            throw new Error(`--predictions must be greater than 0! Got ${numPredictions}`);
          }
          return numPredictions;
        },
      })
      .option("env-version", {
        alias: "v",
        describe: "Node.js major version",
        type: "number",
        choices: NODE_MAJOR_VERSIONS,
      })
      .option("export", {
        alias: "x",
        describe: "File path to export results. Must be to a .json file. Path relative to current working directory!",
        type: "string",
      })
      .option("force", {
        alias: "f",
        describe: "If exporting, overwrite existing file or create needed directories in path",
        type: "boolean",
      });
  },
  handler: async (argv: Arguments) => {
    await handlePredictor(argv);
  },
};

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName("js-randomness-predictor")
  .command(predictCommand)
  .help()
  .argv;

/**
 * This method is responsible for running the predictor. It validates user input
 * and throws errors, if any exist. This is essentially the "core" of our CLI.
 *
 * @param {PredictorArgs} argv : the flags used by the cli.
 * @returns {Promise<PredictorResult>}
 */
export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  try {
    // If the current execution runtime does not equal '--environment' it means we can't auto generate sequence.
    if (!argv.sequence && ExecutionRuntime.type() !== argv.environment) {
      throw new SequenceNotFoundError(
        `'--sequence' is required when '--environment' is '${argv.environment}' and '${EXECUTION_RUNTIME_ENV_VAR_KEY}' is '${ExecutionRuntime.type()}'`,
      );
    }

    //
    // Check if we can auto-generate a sequence.
    //
    // If execution runtime is Node and user provided "-e node" as well as "--env-version N" without "--sequence", but the current Node
    // execution runtime version doesn't match with "--env-version N", it means we can't generate a reliable sequence, so the user HAS
    // to provide a "--sequence" argument. Let them know about this error.
    //
    if (
      ExecutionRuntime.isNode() &&
      argv.environment === "node" &&
      argv.envVersion &&
      !argv.sequence &&
      argv.envVersion !== getCurrentNodeJsMajorVersion()
    ) {
      throw new SequenceNotFoundError(
        `'--sequence' is required when '--environment' is '${argv.environment}' and '--env-version' is different than your current Node.js version! Current Node version is '${getCurrentNodeJsMajorVersion()}' but --env-version is '${argv.envVersion}'`,
      );
    }

    // Default results
    const result: PredictorResult = {
      actual: "You'll need to get this yourself via the same way you generated the sequence",
      sequence: argv.sequence ? argv.sequence : callMathRandom(DEFAULT_SEQUENCE_LENGTH[argv.environment]),
      isCorrect: undefined,
      predictions: [],
      _warnings: [],
      _info: [],
    };

    let numPredictions = argv.predictions !== undefined ? argv.predictions : DEFAULT_NUMBER_OF_PREDICTIONS;

    //
    // V8 specific : check if we will exhaust our pool.
    //
    // If the user provided an '--environment' that is built with V8, we cannot predict accurately past 64 total calls to Math.random
    // without solving symbolic state again.
    //
    // See here for why https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    //
    if (RUNTIME_ENGINE[argv.environment] === "v8" && numPredictions + result.sequence.length > V8_MAX_PREDICTIONS) {
      // Check if sequence.length by itself is >= 64. If so, that's an error bc we have no room for predictions.
      if (result.sequence.length >= V8_MAX_PREDICTIONS) {
        throw new Error(`Sequence too large! Sequence length must be less than '${V8_MAX_PREDICTIONS}', got '${result.sequence.length}'`);
      }
      const numPredictionsLeft = V8_MAX_PREDICTIONS - result.sequence.length;
      numPredictions = numPredictionsLeft; // Truncate predictions to fit bounds.
      result._warnings!.push(
        `Exceeded max predictions!\n` +
          ` - For a sequence length of '${result.sequence.length}', max number of predictions allowed is '${numPredictionsLeft}'.\n` +
          ` - Truncated number of predictions to '${numPredictionsLeft}'.\n` +
          ` - Why? See here : https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion`,
      );
    }

    if (process.env.JSRP_DRY_RUN === "1") {
      return result;
    }

    const predictor: Predictor = JSRandomnessPredictor[argv.environment](result.sequence);
    const nodeMajorVersion = getCurrentNodeJsMajorVersion();

    //
    // Check if user wants to target a different Node version than what they are currently running.
    //
    // We need to run `setNodeVersion(x)` on the current Predictor if the user provided a command that includes `--environment node --env-version N`,
    // but the Node version of the current execution environment (the runtime this script is being executed in) does not match the `--env-version N`
    // provided by the user.
    //
    if (ExecutionRuntime.isNode() && argv.envVersion && argv.environment === "node" && nodeMajorVersion !== argv.envVersion) {
      const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
      predictor.setNodeVersion?.(v);
    }

    // Make predictions
    for (let i = 0; i < numPredictions; i++) {
      const p = await predictor.predictNext();
      result.predictions.push(p);
    }

    // We may be able to auto check if predictions are accurate because we generated the sequence.
    if (!argv.sequence) {
      // Make sure the environment matches the runtime
      switch (argv.environment) {
        case "node": {
          if (ExecutionRuntime.isNode() && (!argv.envVersion || nodeMajorVersion === argv.envVersion)) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "deno": {
          if (ExecutionRuntime.isDeno()) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "bun": {
          if (ExecutionRuntime.isBun()) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
      }
    }

    if (Array.isArray(result.actual)) {
      result.isCorrect = result.actual.every((v, i) => v === result.predictions[i]);
    }
    if (argv.export) {
      exportResult(argv, result);
    }

    return result;
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * The yargs handler
 */
async function handlePredictor(argv: Arguments): Promise<void> {
  try {
    const result = await runPredictor(argv as PredictorArgs & Arguments);

    // If dry run, just log everything, including unformatted warnings/info.
    if (process.env.JSRP_DRY_RUN === "1") {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    const finalResult: PredictorResult = {
      sequence: result.sequence,
      predictions: result.predictions,
      actual: result.actual,
    };

    // Have to check for undefined here, bc well, isCorrect=false is falsey, too.
    if (result?.isCorrect !== undefined) {
      finalResult.isCorrect = result.isCorrect;
    }

    // Show user the final result(s)
    console.log(JSON.stringify(finalResult, null, 2));

    // If any info, show them after results.
    if (result._info && result._info.length) {
      console.log();
      result._info.forEach((info) => Logger.info(info, "\n"));
    }

    // If any warnings, show them after results.
    if (result._warnings && result._warnings.length) {
      console.log();
      result._warnings.forEach((warning) => Logger.warn(warning, "\n"));
    }
  } catch (err: unknown) {
    console.log();
    Logger.error(`Something went wrong!`, (err as Error)?.message, "\n");
    process.exit(1);
  }
}

/**
 * Gets the current Node.js major version
 */
function getCurrentNodeJsMajorVersion(): NodeJsMajorVersion {
  return Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
}

/**
 * Helper to export predictor results to file.
 */
function exportResult(argv: PredictorArgs, result: PredictorResult): void {
  const exportPath = nodepath.resolve(process.cwd(), argv.export!.toString());
  const dirPath = nodepath.dirname(exportPath);
  const fileExists = nodefs.existsSync(exportPath);
  const dirExists = nodefs.existsSync(dirPath);

  if (fileExists && !nodefs.statSync(exportPath).isFile()) {
    result._warnings?.push(`Export path must be to a file! ${exportPath}`);
    return;
  }

  if (nodepath.extname(exportPath) !== ".json") {
    result._warnings?.push(`Export path must be to a .json file! ${exportPath}`);
    return;
  }

  if (fileExists && !argv.force) {
    result._warnings?.push(`Export path already exists and '--force' was not used! Use '--force' to overwrite existing files.`);
    return;
  }

  if (!dirExists && !argv.force) {
    result._warnings?.push(
      `One or more directories does not exist in export path and '--force' was not used! Use '--force' to create full path if it does not exist.`,
    );
    return;
  }

  if (!dirExists && argv.force) {
    nodefs.mkdirSync(dirPath, { recursive: true });
  }

  writeResultsToFile(exportPath, result);
}

function writeResultsToFile(path: string, result: PredictorResult): void {
  try {
    const json: PredictorResult = { sequence: result.sequence, predictions: result.predictions, actual: result.actual };
    if (result.isCorrect !== undefined) {
      json.isCorrect = result.isCorrect;
    }
    nodefs.writeFileSync(path, JSON.stringify(json, null, 2), { encoding: "utf-8" });
    result._info?.push(`Exported results to '${path}'`);
  } catch (e: unknown) {
    result._warnings?.push(`Unable to export results! ${(e as Error).message}`);
  }
}
