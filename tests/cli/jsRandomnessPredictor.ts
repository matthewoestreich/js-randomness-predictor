import { spawnSync, SpawnSyncReturns } from "node:child_process";
import { PredictorArgs } from "../../src/types.ts";

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {string} jsRandomnessPredictorCliPath : path to js-randomness-predictor.js script
 * @param {PredictorArgs} args
 */
export default function jsRandomnessPredictor(jsRandomnessPredictorCliPath: string, args: PredictorArgs): SpawnSyncReturns<string> {
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

  return spawnSync("node", [jsRandomnessPredictorCliPath, ...cmd], { encoding: "utf8" });
}
