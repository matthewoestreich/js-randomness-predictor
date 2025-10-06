import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDb from "../queryRandomNumbersDatabase";

describe("Chrome", () => {
  const runtime = "chrome";
  it(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = JSRandomnessPredictor.chrome(sequence);
    const predictions: number[] = [];
    for (const n of expected) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
