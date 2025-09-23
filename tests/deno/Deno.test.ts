import { describe, it } from "node:test";
import assert from "node:assert";
import { DenoRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";

describe("Deno", () => {
  it("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb("deno", { arrayFrom: true, repl: true });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb("deno", { mathRandomStandalone: true, repl: true });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});
