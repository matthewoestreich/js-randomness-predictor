import { describe, test, expect, TestOptions } from "bun:test";
import { BunRandomnessPredictor } from "../../src/predictors";

function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}

function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

const testOptions: TestOptions = { timeout: secondsToMs(60), retry: 3 };

const MIN_BUN_VERSION_REQUIRED = {
  string: "1.3.8",
  major: 1,
  minor: 3,
  patch: 8,
};

describe("Bun", () => {
  test(`enforce minimum bun version to be ${MIN_BUN_VERSION_REQUIRED.string}`, () => {
    const bunVersion = Bun.version;
    const [major, minor, patch] = bunVersion.split(".").map(Number);
    expect(major).toBeGreaterThanOrEqual(MIN_BUN_VERSION_REQUIRED.major);
    expect(minor).toBeGreaterThanOrEqual(MIN_BUN_VERSION_REQUIRED.minor);
    expect(patch).toBeGreaterThanOrEqual(MIN_BUN_VERSION_REQUIRED.patch);
  });

  test(
    "'sequence' generated with Array.from(), 'expected' generated with Math.random()",
    async () => {
      const sequence = Array.from({ length: 6 }, Math.random);
      const expected = callMathRandom(6);
      const predictor = new BunRandomnessPredictor(sequence);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      expect(predictions).toEqual(expected);
    },
    { ...testOptions },
  );

  test(
    "both 'sequence' and 'expected' generated with Array.from()",
    async () => {
      const sequence = Array.from({ length: 6 }, Math.random);
      const predictor = new BunRandomnessPredictor(sequence);
      const expected = Array.from({ length: 6 }, Math.random);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      // Our sequence and expected both generated via Array.from, so
      // they should have taken the same path, thus making them equal.
      expect(predictions).toEqual(expected);
    },
    { ...testOptions },
  );

  test(
    "both 'sequence' and 'expected' generated with Math.random()",
    async () => {
      const sequence = callMathRandom(6);
      const expected = callMathRandom(6);
      const predictor = new BunRandomnessPredictor(sequence);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      // Our sequence and expected both generated via Math.random calls, so
      // they should have taken the same path, thus making them equal.
      expect(predictions).toEqual(expected);
    },
    { ...testOptions },
  );

  test(
    "tests with a dynamically generated sequence",
    async () => {
      const predictor = new BunRandomnessPredictor();
      const expected = callMathRandom(6);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      expect(predictions).toEqual(expected);
    },
    { ...testOptions },
  );
});
