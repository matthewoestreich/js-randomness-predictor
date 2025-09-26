import { spawnSync } from "node:child_process";
import { RandomNumberGenerationMethod, SequenceAndExpectedRandoms, Runtime, RuntimeOptions } from "./types";

/**
 * Generates a string of JS code, which is designed to get random numbers.
 * This string of JS code is fed to your chosen runtime via cmd line.
 *
 * We have to do this because Deno/Bun/whatever runtimes are available, do not
 * support Z3, so we can't run the predictor natively within the selected runtime.
 *
 * @param {Runtime} runtimeName : the name of the runtime
 * @param {RandomNumberGenerationMethod} sequenceType : generate numbers via Array.from or Math.random
 * @param {number} sequenceLength : how many random numbers in sequence
 * @param {RandomNumberGenerationMethod} expectedType : generate numbers via Array.from or Math.random
 * @param {number} expectedLength : how many random numbers in expected
 * @returns {SequenceAndExpectedRandoms}
 */
export default function getSequenceAndExpectedRandomsFromRuntime(
  runtimeName: Runtime,
  sequenceType: RandomNumberGenerationMethod,
  sequenceLength: number,
  expectedType: RandomNumberGenerationMethod,
  expectedLength: number,
): SequenceAndExpectedRandoms {
  if (sequenceLength <= 0 || expectedLength <= 0) {
    throw new Error(`Both sequence length and expected length must be > 0! sequenceLength=${sequenceLength} expectedLength=${expectedLength}`);
  }

  let runtime: RuntimeOptions;
  let script = "";

  switch (runtimeName) {
    case "bun":
      runtime = { executable: "bun", subcommand: "-e" };
      break;
    case "deno":
      runtime = { executable: "deno", subcommand: "eval" };
  }

  if (!runtime) {
    throw new Error(`Unrecognized runtime : '${runtimeName}'`);
  }

  switch (sequenceType) {
    case "ArrayFrom":
      script += `const sequence = Array.from({ length: ${sequenceLength} }, Math.random);`;
      break;
    case "MathRandom":
      script += `const sequence = [${"Math.random(),".repeat(sequenceLength)}];`;
      break;
  }

  switch (expectedType) {
    case "ArrayFrom":
      script += `const expected = Array.from({ length: ${expectedLength} }, Math.random);`;
      break;
    case "MathRandom":
      script += `const expected = [${"Math.random(),".repeat(expectedLength)}];`;
      break;
  }

  script += "console.log(JSON.stringify({ sequence, expected }));";

  const result = spawnSync(runtime.executable, [runtime.subcommand, script], { encoding: "utf8" });

  if (result.stderr !== "") {
    throw new Error(result.stderr.toString());
  }

  return JSON.parse(result.stdout) as SequenceAndExpectedRandoms;
}
