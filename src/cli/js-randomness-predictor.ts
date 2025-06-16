#!/usr/bin/env node

import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor";
import { PredictorArgs, PREDICTOR_ENVIRONMENTS } from "./types";

const USAGE_STRING = `Usage: $0 --environment <environment> [--sequence <numbers...>] [--predictions <count>]

Options:
  --environment, -e Predictor environment to use (firefox, chrome, v8) (required)
  --sequence, -s    Observed sequence of numbers (required for firefox/chrome)
  --predictions, -p Number of predictions to generate (default is 10)
`;

const predictCommand: CommandModule = {
  command: "*",
  describe: "Predict future Math.random() values",
  builder: (yargs) => {
    return yargs
      .option("environment", {
        alias: "e",
        describe: "Predictor environment to use (firefox, chrome, v8) (required)",
        choices: PREDICTOR_ENVIRONMENTS,
        demandOption: true,
        type: "string",
      })
      .option("sequence", {
        alias: "s",
        describe: "Observed sequence of numbers (required for firefox/chrome)",
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
      .check((argv) => {
        if (argv.use !== "v8" && (!argv.sequence || argv.sequence.length === 0)) {
          throw new Error("The --sequence (-s) option is required when using firefox or chrome.");
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
  .usage(USAGE_STRING)
  .command(predictCommand)
  .help()
  .argv;
