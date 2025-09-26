import { spawnSync } from "node:child_process";

type RandomNumberGenerationMethod = "ArrayFrom" | "MathRandom";
type SequenceAndExpectedRandoms = { sequence: number[]; expected: number[] };

/**
 * Calls Bun from terminal/cmd line with a generated string (that is JS code) used
 * to get random numbers "dynamically" (so we can test using numbers that are not
 * hard-coded)..
 * We have to do this because Bun does not support Z3, so we can't run the predictor
 * natively in Bun.
 * @param {RandomNumberGenerationMethod} sequenceType : generate numbers via Array.from or Math.random
 * @param {number} sequenceLength : how many random numbers in sequence
 * @param {RandomNumberGenerationMethod} expectedType : generate numbers via Array.from or Math.random
 * @param {number} expectedLength : how many random numbers in expected
 * @param {number} seed? : seed PRNG with this number
 * @returns
 */
export default function getSequenceAndExpectedRandomsFromBun(
  sequenceType: RandomNumberGenerationMethod,
  sequenceLength: number,
  expectedType: RandomNumberGenerationMethod,
  expectedLength: number,
  seed?: number,
): SequenceAndExpectedRandoms {
  if (sequenceLength <= 0 || expectedLength <= 0) {
    throw new Error(`Both sequence lenght and expected length must be > 0! sequenceLength=${sequenceLength} expectedLength=${expectedLength}`);
  }

  let script = "";

  if (seed) {
    script += 'import jsc from "bun:jsc";';
    script += `jsc.setRandomSeed(${seed});`;
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

  const result = spawnSync("bun", ["-e", script], { encoding: "utf8" });
  if (result.stderr !== "") {
    throw new Error(result.stderr.toString());
  }
  return JSON.parse(result.stdout) as SequenceAndExpectedRandoms;
}
