import { describe, it } from "node:test";
import assert from "node:assert";
import { BunRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";

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

  it("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});
