#!/usr/bin/env node
import yargs, { Arguments, CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { runPredictor } from "./runPredictor.js";
import { PredictorArgs, PredictorResult, RUNTIMES, NODE_MAJOR_VERSIONS } from "../types.js";
import Logger from "../logger.js";

/**
 * DRY RUN:
 *  - You can use an env var "process.env.JSRP_DRY_RUN = '1'" to only test conditions up to the point where
 *  we are about to create a predictor, but we don't actually create one.
 *  - A dry run DOES NOT RUN THE PREDICTOR, so you will not have any predictions in results.
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
  },
};

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName("js-randomness-predictor")
  .command(predictCommand)
  .help()
  .argv;
