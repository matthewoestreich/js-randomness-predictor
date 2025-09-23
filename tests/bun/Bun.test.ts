import { describe, it } from "node:test";
import assert from "node:assert";
import { BunRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";

describe("Bun", () => {
  it("should be correct when using Array.fom", async () => {
    const { sequence, expected } = queryDb("bun", { arrayFrom: true });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls", async () => {
    const { sequence, expected } = queryDb("bun", { mathRandomStandalone: true });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb("bun", { arrayFrom: true, repl: true });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb("bun", { mathRandomStandalone: true, repl: true });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});
