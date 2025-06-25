#!/usr/bin/env node

import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor.js";
import { PredictorArgs, PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS, SequenceNotFoundError } from "./types.js";

const predictCommand: CommandModule = {
  command: "*",
  describe: "Predict future Math.random() values",
  builder: (yargs) => {
    return yargs
      .option("environment", {
        alias: "e",
        describe: "Predictor environment",
        // Add node so people can use "v8" and "node" interchangeably.
        // We don't want to mess with our underlying types, though, which
        // is why it wasn't added directly to PREDICTOR_ENVIRONMENTS.
        choices: [...PREDICTOR_ENVIRONMENTS, "node"],
        demandOption: true,
        type: "string",
        // So people can use "v8" and "node" interchangeably.
        coerce: (s: string) => (s === "node" ? "v8" : s),
      })
      .option("sequence", {
        alias: "s",
        describe: "Observed sequence of numbers, separated by space (required for firefox/chrome)",
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
        describe: "Number of predictions to generate",
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
        // If the environment is not V8 and there was no sequence provided, throw an error.
        if (argv.sequence === undefined && argv.environment !== "v8") {
          throw new SequenceNotFoundError("'--sequence' is only optional when '--environment' is 'v8'.");
        }
        // If the environment is V8 and a specific version was provided and the sequence is not defined, throw an error.
        // Sequence is required when doing `-e v8 -v 24`.
        if (argv.environment === "v8" && argv.envVersion !== undefined && argv.sequence === undefined) {
          throw new SequenceNotFoundError("'--sequence' is required when '--environment' is 'v8' and '--env-version' is defined!");
        }
        return true;
      });
  },
  handler: async (argv: Arguments) => {
    try {
      const result = await runPredictor(argv as PredictorArgs & Arguments);
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error(err.message);
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
