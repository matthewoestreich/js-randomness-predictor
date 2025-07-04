#!/usr/bin/env node

import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor.js";
import { PredictorArgs, PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS, SequenceNotFoundError, NodeJsMajorVersion } from "../types.js";
import { UnsatError } from "../errors.js";

export function getCurrentNodeJsMajorVersion(): NodeJsMajorVersion {
  return Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
}

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
      })
      .option("env-version", {
        alias: "v",
        describe: "Node.js major version",
        type: "number",
        choices: ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS,
      })
      .check((argv) => {
        argv._currentNodeJsMajorVersion = getCurrentNodeJsMajorVersion();
        const isNodeOrV8 = argv.environment === "node" || argv.environment === "v8";
        const isNodeVersionMatch = argv.envVersion === argv._currentNodeJsMajorVersion;

        // If the --environment is not v8 or node the --sequence is required!
        if (!argv.sequence && !isNodeOrV8) {
          throw new SequenceNotFoundError(`'--sequence' is required when '--environment' is '${argv.environment}'`);
        }

        // * If the conditions below are met:
        //    Throw an error.
        //    Sequence is required when doing `-e (v8|node) -v N` where `-v N` is != current nodejs major version.
        // * Conditions that need to be met:
        //    - The --environment is v8 or node
        //    - The --env-version was provided
        //    - The --sequence was NOT provided
        //    - The --env-version does NOT match the users current running node version
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
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      const jsonError = {
        error: "Something went wrong! " + err?.message,
      };
      console.error(JSON.stringify(jsonError, null, 2));
      process.exit(1);
    }
  },
};

// prettier-ignore
yargs(hideBin(process.argv))
  .scriptName("js-randomness-predictor")
  .usage("Usage:\n$0 --environment <env> [--env-version <environment_version>] [--sequence <numbers...>] [--predictions <count>]")
  .command(predictCommand)
  .help()
  .argv;
