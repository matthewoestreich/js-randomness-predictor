import nodepath from "node:path";
import nodefs from "node:fs";
import { spawnSync, SpawnSyncReturns, SpawnSyncOptionsWithStringEncoding } from "node:child_process";
import { PredictorArgs } from "../../src/types.ts";
import { CallJsRandomnessPredictorCliExtendedOptions } from "../types.ts";

const JSRP_CLI_PATH = nodepath.resolve(import.meta.dirname, "../../dist/esm/cli/cli.js");

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {PredictorArgs} args
 * @param {CallJsRandomnessPredictorCliExtendedOptions} extendedOptions : misc environmental options unrelated to CLI args.
 */
export default function callJsRandomnessPredictorCli(
  args: PredictorArgs,
  extendedOptions?: CallJsRandomnessPredictorCliExtendedOptions,
): SpawnSyncReturns<string> {
  (extendedOptions ||= {}).jsRandomnessPredictorCliPath = JSRP_CLI_PATH;

  const { environment, envVersion, sequence, predictions, force, export: exportPath } = args;
  const cmd: string[] = ["-e", environment];

  if (envVersion) {
    cmd.push("-v", envVersion.toString());
  }

  if (sequence?.length) {
    cmd.push("-s", ...sequence.map(String));
  }

  if (predictions) {
    cmd.push("-p", predictions.toString());
  }

  if (exportPath) {
    cmd.push("-x", exportPath);
  }

  if (force) {
    cmd.push("--force");
  }

  const options: SpawnSyncOptionsWithStringEncoding = { encoding: "utf-8", env: { ...process.env } };
  if (extendedOptions?.isDryRun) {
    options.env!.JSRP_DRY_RUN = "1";
  }
  if (extendedOptions?.executionRuntime) {
    options.env!.JSRP_RUNTIME = extendedOptions.executionRuntime;
  }

  return spawnSync("node", [extendedOptions.jsRandomnessPredictorCliPath, ...cmd], options);
}
