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
  major: 1,
  minor: 3,
  patch: 8,
};

const { major: minMajor, minor: minMinor, patch: minPatch } = MIN_BUN_VERSION_REQUIRED;

describe("Bun", () => {
  test(`enforce minimum Bun version to be at least v${minMajor}.${minMinor}.${minPatch}`, () => {
    const [major, minor, patch] = Bun.version.split(".").map(Number);

    // If the major is greater, no need to compare anything else.
    if (major > minMajor) {
      return expect(major).toBeGreaterThan(minMajor);
    }

    // If major isn't greater than min, it should at least equal min.
    expect(major).toBe(minMajor);

    // If minor is greater than min, no need to check patch.
    if (minor > minMinor) {
      return expect(minor).toBeGreaterThan(minMinor);
    }

    // If minor isn't greater, it should at least equal min.
    expect(minor).toBe(minMinor);
    // Patch has to be greater than or equal to min.
    expect(patch).toBeGreaterThanOrEqual(minPatch);
  });

  // Requiring a minimum Bun version is needed due to this test and a bug in WebKit prior to v1.3.x
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
