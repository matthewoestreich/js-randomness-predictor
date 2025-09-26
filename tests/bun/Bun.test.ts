import { describe, it } from "node:test";
import assert from "node:assert";
import { BunRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";
import getSequenceAndExpectedRandomsFromBun from "./getSequenceAndExpectedRandomsFromBun";

describe("Bun", () => {
  const runtime = "bun";

  it("should be correct when using Array.fom", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});

/**
 * These tests call bun from terminal to get random numbers dynamically
 * (not hard coded random numbers)
 */
describe("Bun : Dynamic Random Numbers (call Bun from terminal)", () => {
  it("sequence generated with Array.from(), expected generated with Math.random()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromBun("ArrayFrom", 6, "MathRandom", 10);
    const predictor = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    // Array.from and MathRandom should take two diff paths.
    // Array.from takes the slow path.
    // MathRandom takes the JIT path.
    // So they took two diff paths, we should expect them to not be equal.
    assert.notDeepStrictEqual(predictions, expected);
  });

  it("both sequence and expected generated with Array.from()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromBun("ArrayFrom", 6, "ArrayFrom", 10);
    const predictor = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    // Our sequence and expected both generated via Array.from, so
    // they should have taken the same path, thus making them equal.
    assert.deepStrictEqual(predictions, expected);
  });

  it("both sequence and expected generated with Math.random()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromBun("MathRandom", 6, "MathRandom", 10);
    const predictor = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    // Our sequence and expected both generated via Math.random calls, so
    // they should have taken the same path, thus making them equal.
    assert.deepStrictEqual(predictions, expected);
  });
});
