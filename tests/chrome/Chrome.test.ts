import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDb from "../queryRandomNumbersDatabase";

describe("Chrome", () => {
  const runtime = "chrome";
  it(`should predict accurately using number prior to Jan 2026 update`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = JSRandomnessPredictor.chrome(sequence);
    const predictions: number[] = [];
    for (const _ of expected) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });

  it(`should predict accurately using numbers after Jan 2026 update`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { afterJanuary2026Update: true } });
    const p = JSRandomnessPredictor.chrome(sequence);
    const predictions: number[] = [];
    for (const _ of expected) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });

  // Need to ensure the predictor actually fails if retry fails.
  it(`should fail to predict if retry fails`, async () => {
    const { sequence } = queryDb({ runtime, tags: { afterJanuary2026Update: true } });
    // Push a random number, causing the sequence to become invalid.
    sequence.push(Math.random());
    const p = JSRandomnessPredictor.chrome(sequence);
    await assert.rejects(() => p.predictNext());
  });
});
