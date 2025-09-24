import FirefoxRandomnessPredictor from "../../src/predictors/Firefox";
import { describe as suite, it as test } from "node:test";
import assert from "node:assert";
import queryDb from "../getRandomNumbersFromDatabase";

suite("Firefox", () => {
  const runtime = "firefox";

  test(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const p = new FirefoxRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
