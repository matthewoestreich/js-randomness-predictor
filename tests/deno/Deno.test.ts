import { suite, test } from "node:test";
import assert from "node:assert";
import { DenoRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";

suite("Deno", () => {
  const runtime = "deno";

  test("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  test("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const deno = new DenoRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});
