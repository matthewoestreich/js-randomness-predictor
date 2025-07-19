import FirefoxRandomnessPredictor from "../src/predictors/Firefox";
import { describe, it } from "node:test";
import assert from "node:assert";

const SEQUENCE = [0.1321263101773572, 0.03366887439746058, 0.032596957696410134, 0.9986575482138969];

const EXPECTED = [
  0.8479779907956815, 0.13963871472821332, 0.25068024611907636, 0.6656237481612675, 0.7381091878692425, 0.8709382509549467, 0.49171337524788294,
  0.6991749430716799, 0.9530887478758369, 0.781511163650037, 0.699311162730038,
];

describe("Firefox", () => {
  it(`should predict the next ${EXPECTED.length} numbers`, async () => {
    const p = new FirefoxRandomnessPredictor(SEQUENCE);
    const predictions: number[] = [];
    for (let i = 0; i < EXPECTED.length; i++) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(EXPECTED, predictions);
  });
});
