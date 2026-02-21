#!/usr/bin/env node

import nodefs from "node:fs";
import nodepath from "node:path";
import yargs, { ArgumentsCamelCase, CommandModule } from "yargs";
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
const predictCommand: CommandModule<{}, PredictorArgs> = {
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
  handler: async (argv: ArgumentsCamelCase<PredictorArgs>) => {
    await executePredictionCommand(argv);
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
 * and throws errors, if any exist.
 *
 * This is essentially the "core" of our CLI.
 */
async function executePredictionCommand(argv: ArgumentsCamelCase<PredictorArgs>): Promise<void> {
  try {
    assertSequenceRequirements(argv);

    const result: PredictorResult = {
      actual: "You'll need to get this yourself via the same way you generated the sequence",
      sequence: argv.sequence ? argv.sequence : callMathRandom(DEFAULT_SEQUENCE_LENGTH[argv.environment]),
      isCorrect: undefined,
      predictions: [],
      _warnings: [],
      _info: [],
    };

    const numPredictions = computePredictionCount(argv, result);

    if (process.env.JSRP_DRY_RUN === "1") {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    const predictor: Predictor = JSRandomnessPredictor[argv.environment](result.sequence);

    applyTargetNodeVersionMaybe(argv, predictor);
    await makePredictions(predictor, result, numPredictions);
    populateActualResults(argv, result, numPredictions);
    evaluatePredictionAccuracy(result);

    if (argv.export) {
      exportResult(argv, result);
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
 * Ensures we were given a sequence if one is required based upon args.
 *
 * Will throw an error if either of the following is true:
 *
 * 1. If a `--sequence` was not provided and the current execution runtime does not equal '--environment',
 *   it means we can't auto generate sequence.
 *
 * 2. If a `--sequence` was not provided and the following flags were used: `--environment node --env-version N` where
 *   `--env-version N` does not match current execution runtime version. This means we cannot automatically generate a
 *   reliable sequence and the user will need to provide a `--sequence`.
 */
function assertSequenceRequirements(argv: PredictorArgs): void {
  if (!argv.sequence && ExecutionRuntime.type() !== argv.environment) {
    throw new SequenceNotFoundError(
      `'--sequence' is required when '--environment' is '${argv.environment}' and '${EXECUTION_RUNTIME_ENV_VAR_KEY}' is '${ExecutionRuntime.type()}'`,
    );
  }
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
}

/**
 * Computes the number of predictions to make. Accounts for V8 pool exhaustion.
 *
 * If the user provided an '--environment' that is built with V8, we cannot predict accurately past 64 total calls to Math.random
 * without solving symbolic state again.
 *
 * See here for why https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
 */
function computePredictionCount(argv: PredictorArgs, result: PredictorResult): number {
  let numPredictions = argv.predictions !== undefined ? argv.predictions : DEFAULT_NUMBER_OF_PREDICTIONS;

  // If not V8, we have no limit.
  if (RUNTIME_ENGINE[argv.environment] !== "v8") {
    return numPredictions;
  }

  // Check if sequence.length by itself is >= 64. If so, that's an error bc we have no room for predictions.
  if (result.sequence.length >= V8_MAX_PREDICTIONS) {
    throw new Error(`Sequence too large! Sequence length must be less than '${V8_MAX_PREDICTIONS}', got '${result.sequence.length}'`);
  }

  // We are within bounds.
  if (numPredictions + result.sequence.length <= V8_MAX_PREDICTIONS) {
    return numPredictions;
  }

  // We are out of bounds; truncate predictions to fit bounds.
  const numPredictionsRemaining = V8_MAX_PREDICTIONS - result.sequence.length;
  result._warnings!.push(
    `Exceeded max predictions!\n` +
      ` - For a sequence length of '${result.sequence.length}', max number of predictions allowed is '${numPredictionsRemaining}'.\n` +
      ` - Truncated number of predictions to '${numPredictionsRemaining}'.\n` +
      ` - Why? See here : https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion`,
  );
  return numPredictionsRemaining;
}

/**
 * Only applicable if `--environment` is `node`! Check if user wants to target a different Node version than what they are currently running.
 *
 * We need to run `setNodeVersion(x)` on the current Predictor if the user provided a command that includes `--environment node --env-version N`,
 * but the Node version of the current execution environment (the runtime this script is being executed in) does not match the `--env-version N`
 * provided by the user.
 */
function applyTargetNodeVersionMaybe(argv: PredictorArgs, predictor: Predictor): void {
  if (ExecutionRuntime.isNode() && argv.envVersion && argv.environment === "node" && getCurrentNodeJsMajorVersion() !== argv.envVersion) {
    predictor.setNodeVersion?.({ major: Number(argv.envVersion), minor: 0, patch: 0 });
  }
}

/**
 * Generate actual Math.random output and add to result (specifically, the `result.actual` field), if possible.
 *
 * We may be able to auto check if predictions are accurate because we generated the sequence. In order to be able
 * to validate results, no sequence should have been provided and the environment must match execution runtime.
 */
function populateActualResults(argv: PredictorArgs, result: PredictorResult, numPredictions: number): void {
  // The user provided a sequence, which means we did not auto-generate the sequence, which means we cannot automatically validate results.
  if (argv.sequence) {
    return;
  }
  if (
    ("node" === argv.environment && ExecutionRuntime.isNode() && (!argv.envVersion || getCurrentNodeJsMajorVersion() === argv.envVersion)) ||
    ("deno" === argv.environment && ExecutionRuntime.isDeno()) ||
    ("bun" === argv.environment && ExecutionRuntime.isBun())
  ) {
    result.actual = callMathRandom(numPredictions);
  }
}

/**
 * Make predictions and add them to result
 */
async function makePredictions(predictor: Predictor, result: PredictorResult, numPredictions: number): Promise<void> {
  for (let i = 0; i < numPredictions; i++) {
    const p = await predictor.predictNext();
    result.predictions.push(p);
  }
}

/**
 * If we have `actual` values, validate them.
 */
function evaluatePredictionAccuracy(result: PredictorResult): void {
  if (Array.isArray(result.actual)) {
    result.isCorrect = result.actual.every((v, i) => v === result.predictions[i]);
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
