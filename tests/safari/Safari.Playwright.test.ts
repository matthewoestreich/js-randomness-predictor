import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it, after } from "node:test";
import assert from "node:assert";
import { webkit, Page } from "playwright";

/**
 * These tests use playwright to automate js-randomness-predictor usage in a browser (safari in this case).
 *
 * Unlike Chrome and Firefox, there is no way to easily download arbitrary Safari versions. Therefore, we
 * **only test the latest Safari release**. This should be sufficient to warn us of any breaking changes
 * that Safari makes.
 */

const SEQUENCE_LENGTH = 6;
const NUMBER_OF_PREDICTIONS = 10;

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}

describe(`Safari : Automated Testing via Playwright`, async () => {
  const safari = await webkit.launch();

  it(`safari ${safari.version()} [newest release] accurately predicts using dynamic generated values`, async () => {
    const context = await safari.newContext();
    const page = await context.newPage();

    try {
      const sequence = await generateRandomNumbersFromPage(page, SEQUENCE_LENGTH);
      const expected = await generateRandomNumbersFromPage(page, NUMBER_OF_PREDICTIONS);

      const predictor = JSRandomnessPredictor.safari(sequence);
      const predictions = [];

      for (let i = 0; i < NUMBER_OF_PREDICTIONS; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    } finally {
      await safari.close();
    }
  });
});
