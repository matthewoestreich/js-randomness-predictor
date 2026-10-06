import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import { webkit, Page, Browser } from "playwright";

/**
 * These tests use playwright to automate js-randomness-predictor usage in a browser (safari in this case).
 *
 * Unlike Chrome and Firefox, there is no way to easily download arbitrary Safari versions. Therefore, we
 * **only test the latest Safari release**. This should be sufficient to warn us of any breaking changes
 * that Safari makes.
 */

const SEQUENCE_LENGTH = 6;
const NUMBER_OF_PREDICTIONS = 10;

let safari: Browser;

try {
  safari = await webkit.launch();
} catch (err: unknown) {
  let message = "WebKit/Safari install not found!\nPlease run `npx playwright install webkit --with-deps` to install it and try again!";
  if (err instanceof Error) {
    message = `${err.message}\nOr ${message}`;
  }
  throw new Error(message);
}

describe(`Safari : Automated Testing via Playwright`, () => {
  it(`[newest release] safari ${safari.version()} accurately predicts using dynamic generated values`, async () => {
    try {
      const page = await safari.newPage();
      const sequence = await generateRandomNumbersFromPage(page, SEQUENCE_LENGTH);
      const expected = await generateRandomNumbersFromPage(page, NUMBER_OF_PREDICTIONS);
      const predictor = JSRandomnessPredictor.safari(sequence);
      const predictions = [];

      for (let i = 0; i < NUMBER_OF_PREDICTIONS; i++) {
        predictions.push(await predictor.predictNext());
      }

      assert.deepStrictEqual(predictions, expected);
    } finally {
      await safari.close();
    }
  });
});

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
