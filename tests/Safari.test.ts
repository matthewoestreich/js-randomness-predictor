import SafariRandomnessPredictor from "../src/predictors/Safari";
import { describe, it } from "node:test";
import assert from "node:assert";

const SEQUENCE = [0.8651485656540925, 0.11315724215685208, 0.3153950773233716, 0.45825597860463274];

const EXPECTED = [
  0.31143815234233363, 0.6973996606199063, 0.2146174701215342, 0.098415677735185, 0.6908723218385805, 0.43568239375320583, 0.5537079837658566,
  0.9190574467880481, 0.14789834036423333, 0.8477134504145751, 0.8636173753361875, 0.921914547452633, 0.4377690900199249, 0.759557924932666,
  0.5003933241991145, 0.0589099881389864,
];

describe("Safari", () => {
  it(`should predict the next ${EXPECTED.length} numbers`, async () => {
    const p = new SafariRandomnessPredictor(SEQUENCE);
    const predictions: number[] = [];
    for (let i = 0; i < EXPECTED.length; i++) {
      predictions.push(await p.predictNext());
    }
    assert.deepStrictEqual(EXPECTED, predictions);
  });
});
