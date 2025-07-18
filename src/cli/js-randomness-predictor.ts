#!/usr/bin/env node

import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor.js";
import { PredictorArgs, NodeJsMajorVersion, PredictorResult } from "../types.js";
import { PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS } from "../constants.js";
import { SequenceNotFoundError } from "../errors.js";
import Logger from "../logger.js";

const predictCommand: CommandModule = {
  command: "*",
  describe: "Predict future Math.random() values",
  builder: (yargs) => {
    return yargs
      .option("environment", {
        alias: "e",
        describe: "Predictor environment",
        choices: PREDICTOR_ENVIRONMENTS,
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
        choices: ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS,
      })
      .check((argv) => {
        argv._currentNodeJsMajorVersion = Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
        const isNodeOrV8 = argv.environment === "node" || argv.environment === "v8";
        const isNodeVersionMatch = argv.envVersion === argv._currentNodeJsMajorVersion;

        // If the --environment is not v8 or node the --sequence is required!
        if (!argv.sequence && !isNodeOrV8) {
          throw new SequenceNotFoundError(`'--sequence' is required when '--environment' is '${argv.environment}'`);
        }

        // * If:
        //    - The --environment is v8 or node
        //    - The --env-version was provided
        //    - The --sequence was NOT provided
        //    - The --env-version does NOT match the users current running node version
        // * Then:
        //    Throw an error. Sequence is required when doing `-e (v8|node) -v X` where `X` is != current nodejs major version.
        if (isNodeOrV8 && argv.envVersion && !argv.sequence && !isNodeVersionMatch) {
          throw new SequenceNotFoundError(
            `'--sequence' is required when '--environment' is '${argv.environment}' and '--env-version' is different than your current Node.js version!`,
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
