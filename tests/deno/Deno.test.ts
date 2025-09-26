import { describe, it } from "node:test";
import assert from "node:assert";
import { DenoRandomnessPredictor } from "../../src/predictors";
import queryDb from "../queryRandomNumbersDatabase";
import getSequenceAndExpectedRandomsFromRuntime from "../getSequenceAndExpectedRandomFromRuntime";

describe("Deno", () => {
  const runtime = "deno";

  it("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});

/**
 * These tests call deno from terminal to get random numbers dynamically
 * (not hard coded random numbers). We have to do this because Deno does
 * not support Z3, so we cannot run our predictor/tests natively in Deno.
 */
describe("Deno : Dynamic Random Numbers (call Deno from terminal)", () => {
  it("'sequence' generated with Array.from(), 'expected' generated with Math.random()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromRuntime("deno", "ArrayFrom", 4, "MathRandom", 10);
    const predictor = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("both 'sequence' and 'expected' generated with Array.from()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromRuntime("deno", "ArrayFrom", 4, "ArrayFrom", 10);
    const predictor = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("both 'sequence' and 'expected' generated with Math.random()", async () => {
    const { sequence, expected } = getSequenceAndExpectedRandomsFromRuntime("deno", "MathRandom", 4, "MathRandom", 10);
    const predictor = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await predictor.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});
