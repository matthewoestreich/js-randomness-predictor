import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import { chromium, Page, Browser as PlaywrightBrowser } from "playwright";
import { computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser as PuppeteerBrowser, BrowserPlatform } from "@puppeteer/browsers";

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

let chrome: PlaywrightBrowser;

if (process.env.VERSION_OR_TAG && process.env.CACHE_DIRECTORY) {
  /*
   * This "if" block is for when this test is ran via CI/CD
   */
  const browser = PuppeteerBrowser.CHROME;
  const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
  const buildId = await resolveBuildId(browser, platform, process.env.VERSION_OR_TAG);
  const executablePath = computeExecutablePath({
    browser,
    buildId,
    cacheDir: process.env.CACHE_DIRECTORY,
  });
  chrome = await chromium.launch({ executablePath, headless: true });
} else {
  /*
   * This "else" block is for when this test is ran locally on a devs machine
   */
  chrome = await chromium.launch({ channel: "chrome", headless: true });
  console.info(
    `\n[NOTE] We have detected you are running this test locally.\n[NOTE] We only test the version of Chrome (${chrome.version()}) you have installed!\n`,
  );
}

describe(`Chrome : Automated Testing via Playwright`, async () => {
  it(`chrome ${chrome.version()} accurately predicts using dynamic generated values`, async () => {
    try {
      const page = await chrome.newPage();
      const sequence = await generateRandomNumbersFromPage(page, SEQUENCE_LENGTH);
      const expected = await generateRandomNumbersFromPage(page, NUMBER_OF_PREDICTIONS);
      const predictor = JSRandomnessPredictor.chrome(sequence);
      const predictions = [];

      for (let i = 0; i < NUMBER_OF_PREDICTIONS; i++) {
        predictions.push(await predictor.predictNext());
      }

      assert.deepStrictEqual(predictions, expected);
    } finally {
      await chrome.close();
    }
  });
});

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
