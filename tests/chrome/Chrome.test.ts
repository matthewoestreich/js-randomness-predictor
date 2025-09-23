import ChromeRandomnessPredictor from "../../src/predictors/Chrome";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDb from "../getRandomNumbersFromDatabase";

describe("Chrome", () => {
  const runtime = "chrome";
  it(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = new ChromeRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (const n of expected) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
