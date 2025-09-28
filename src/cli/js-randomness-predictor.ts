#!/usr/bin/env node

import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor.js";
import { PredictorArgs, PredictorResult, RUNTIMES, NODE_MAJOR_VERSIONS, IS_SERVER_RUNTIME } from "../types.js";
import { SequenceNotFoundError } from "../errors.js";
import Logger from "../logger.js";
import { getCurrentNodeJsMajorVersion } from "./utils.js";
import ExecutionRuntime from "../ExecutionRuntime.js";

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
      })
      .check((argv) => {
        // If the --environment is not a server runtime the --sequence is required!
        if (!argv.sequence && !IS_SERVER_RUNTIME[argv.environment]) {
          throw new SequenceNotFoundError(`'--sequence' is required when '--environment' is '${argv.environment}'`);
        }

        // If we are running in Node and user provided "-e node" as well as "--env-version N" without "--sequence",
        // but the current Node execution version doesn't match with "--env-version N", it means we can't generate
        // a reliable sequence, so the user HAS to provide a "--sequence" argument. Let them know about this error.
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

        return true;
      });
  },
  handler: async (argv: Arguments) => {
    try {
      const result = await runPredictor(argv as PredictorArgs & Arguments);

      const finalResult: PredictorResult = {
        sequence: result.sequence,
        predictions: result.predictions,
        actual: result.actual,
      };
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
  },
};

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName("js-randomness-predictor")
  .usage("Usage:\n$0 --environment <env> [--env-version <environment_version>] [--sequence <numbers...>] [--predictions <count>]")
  .command(predictCommand)
  .help()
  .argv;
