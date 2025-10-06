import JSRandombessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDb from "../queryRandomNumbersDatabase";

describe("Firefox", () => {
  const runtime = "firefox";

  it(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = JSRandombessPredictor.firefox(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
