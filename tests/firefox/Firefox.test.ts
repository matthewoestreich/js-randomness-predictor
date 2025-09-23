import FirefoxRandomnessPredictor from "../../src/predictors/Firefox";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDb from "../getRandomNumbersFromDatabase";

describe("Firefox", () => {
  it(`should predict accurately`, async () => {
    const { sequence, expected } = queryDb("firefox", {});
    const p = new FirefoxRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
