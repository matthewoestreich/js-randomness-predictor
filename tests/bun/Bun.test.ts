import { describe, it, expect, TestOptions } from "bun:test";
import BunRandomnessPredictor from "../../src/predictors/Bun.ts";

function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}

const testOptions: TestOptions = { timeout: 15000, retry: 3 };

describe("Bun", () => {
  it(
    "'sequence' generated with Array.from(), 'expected' generated with Math.random()",
    async () => {
      /**
       * If/when this test starts failing, it means the bug in JavaScriptCore has been patched!
       */
      const sequence = Array.from({ length: 7 }, Math.random);
      const expected = callMathRandom(6);
      const predictor = new BunRandomnessPredictor(sequence);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      // ~ Due to current JavaScriptCore bug ~
      // Array.from({length:n},Math.random) takes the slow baseline path.
      // Math.random() takes the JIT path.
      // Since they took two diff paths, we should expect their results to not be equal.
      expect(predictions).not.toStrictEqual(expected);
    },
    testOptions,
  );

  it(
    "both 'sequence' and 'expected' generated with Array.from()",
    async () => {
      const sequence = Array.from({ length: 7 }, Math.random);
      const expected = Array.from({ length: 6 }, Math.random);
      const predictor = new BunRandomnessPredictor(sequence);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      // Our sequence and expected both generated via Array.from, so
      // they should have taken the same path, thus making them equal.
      expect(predictions).toStrictEqual(expected);
    },
    testOptions,
  );

  it(
    "both 'sequence' and 'expected' generated with Math.random()",
    async () => {
      const sequence = callMathRandom(7);
      const expected = callMathRandom(6);
      const predictor = new BunRandomnessPredictor(sequence);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      // Our sequence and expected both generated via Math.random calls, so
      // they should have taken the same path, thus making them equal.
      expect(predictions).toStrictEqual(expected);
    },
    testOptions,
  );

  it(
    "tests with a dynamically generated sequence",
    async () => {
      const predictor = new BunRandomnessPredictor();
      const expected = callMathRandom(6);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      expect(predictions).toStrictEqual(expected);
    },
    testOptions,
  );
});
