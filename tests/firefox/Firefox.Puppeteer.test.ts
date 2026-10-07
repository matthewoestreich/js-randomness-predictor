import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import { firefox as spidermonkey, Page, Browser as PlaywrightBrowser } from "playwright";
import { computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser as PuppeteerBrowser, BrowserPlatform } from "@puppeteer/browsers";

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

let firefox: PlaywrightBrowser;

if (process.env.VERSION_OR_TAG && process.env.CACHE_DIRECTORY) {
  /*
   * This "if" block is for when this test is ran via CI/CD
   */
  const browser = PuppeteerBrowser.FIREFOX;
  const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
  const buildId = await resolveBuildId(browser, platform, process.env.VERSION_OR_TAG);
  const executablePath = computeExecutablePath({
    browser,
    buildId,
    cacheDir: process.env.CACHE_DIRECTORY,
  });
  firefox = await spidermonkey.launch({ executablePath, headless: true });
} else {
  /*
   * This "else" block is for when this test is ran locally on a devs machine
   */
  firefox = await spidermonkey.launch({ headless: true });
  console.info(
    `\n[NOTE] We have detected you are running this test locally.\nPlease note we only test the version of Firefox (${firefox.version()}) you have installed!\n`,
  );
}

describe(`Firefox : Automated Testing via Playwright`, async () => {
  it(`firefox ${firefox.version()} accurately predicts using dynamic generated values`, async () => {
    try {
      const page = await firefox.newPage();
      const sequence = await generateRandomNumbersFromPage(page, SEQUENCE_LENGTH);
      const expected = await generateRandomNumbersFromPage(page, NUMBER_OF_PREDICTIONS);
      const predictor = JSRandomnessPredictor.firefox(sequence);
      const predictions = [];

      for (let i = 0; i < NUMBER_OF_PREDICTIONS; i++) {
        predictions.push(await predictor.predictNext());
      }

      assert.deepStrictEqual(predictions, expected);
    } finally {
      await firefox.close();
    }
  });
});

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
