import ChromeRandomnessPredictor from "../../src/predictors/Chrome";
import { suite, test } from "node:test";
import assert from "node:assert";
import queryDb from "../getRandomNumbersFromDatabase";

suite("Chrome", () => {
  const runtime = "chrome";
  test(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = new ChromeRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (const n of expected) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
