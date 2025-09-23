import { spawnSync, SpawnSyncReturns } from "node:child_process";
import { PREDICTOR_ENVIRONMENTS } from "../../src/constants.ts";

type Flags = {
  environment: NonNullable<(typeof PREDICTOR_ENVIRONMENTS)[number]>;
  envVersion?: number;
  sequence?: number[];
  predictions?: number;
};

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {string} jsRandomnessPredictorCliPath : path to js-randomness-predictor.js script
 * @param {Flags} flags
 */
export function jsRandomnessPredictor(jsRandomnessPredictorCliPath: string, flags: Flags): SpawnSyncReturns<string> {
  const { environment, envVersion, sequence, predictions } = flags;
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
  return spawnSync("node", [jsRandomnessPredictorCliPath, ...args], { encoding: "utf8" });
}

/**
 * Instead of just writing errors to stderr and silently continuing, we throw those errors.
 * @param {SpawnSyncReturns<T>} ssr
 */
export function stderrThrows<T>(ssr: SpawnSyncReturns<T>): void {
  if (ssr.stderr !== "") {
    throw new Error((ssr.stderr as string).toString());
  }
  if (ssr.error !== undefined) {
    throw ssr.error;
  }
}
