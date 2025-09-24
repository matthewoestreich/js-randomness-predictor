import { spawnSync, SpawnSyncReturns } from "node:child_process";
import { JSRandomnessPredictorCliArgs } from "../../src/types.ts";

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {string} jsRandomnessPredictorCliPath : path to js-randomness-predictor.js script
 * @param {JSRandomnessPredictorCliArgs} flags
 */
export default function jsRandomnessPredictor(jsRandomnessPredictorCliPath: string, flags: JSRandomnessPredictorCliArgs): SpawnSyncReturns<string> {
  const { environment, envVersion, sequence, predictions, force, export: exportPath } = flags;
  const args: string[] = ["-e", environment];
  if (envVersion) {
    args.push("-v", envVersion.toString());
  }
  if (sequence?.length) {
    args.push("-s", ...sequence.map(String));
  }
  if (predictions) {
    args.push("-p", predictions.toString());
  }
  if (exportPath) {
    args.push("-x", exportPath);
  }
  if (force) {
    args.push("--force");
  }
  return spawnSync("node", [jsRandomnessPredictorCliPath, ...args], { encoding: "utf8" });
}
