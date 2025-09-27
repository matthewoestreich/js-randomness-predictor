import { describe, it, expect } from "bun:test";
import BunRandomnessPredictor from "../../src/predictors/Bun.ts";

function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}

describe("Bun", () => {
  it("'sequence' generated with Array.from(), 'expected' generated with Math.random()", async () => {
    /**
     * If/when this test starts failing, it means the bug in JavaScriptCore has been patched!
     */
    const sequence = Array.from({ length: 8 }, Math.random);
    const expected = callMathRandom(10);
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
  });

  it("both 'sequence' and 'expected' generated with Array.from()", async () => {
    const sequence = Array.from({ length: 10 }, Math.random);
    const expected = Array.from({ length: 10 }, Math.random);
    const predictor = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    // Our sequence and expected both generated via Array.from, so
    // they should have taken the same path, thus making them equal.
    expect(predictions).toStrictEqual(expected);
  });

  it("both 'sequence' and 'expected' generated with Math.random()", async () => {
    const sequence = callMathRandom(8);
    const expected = callMathRandom(10);
    const predictor = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    // Our sequence and expected both generated via Math.random calls, so
    // they should have taken the same path, thus making them equal.
    expect(predictions).toStrictEqual(expected);
  });

  it("tests with a dynamically generated sequence", async () => {
    const predictor = new BunRandomnessPredictor();
    const expected = callMathRandom(10);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    expect(predictions).toStrictEqual(expected);
  });
});
