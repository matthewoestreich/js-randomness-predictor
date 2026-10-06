import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import puppeteer, { Page } from "puppeteer";
import { install, computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser, BrowserPlatform, BrowserTag } from "@puppeteer/browsers";

/**
 * Since we are testing arbitrary versions of Firefox we have to use `puppeteer/browsers` to first
 * download and install said browsers.  In the Chrome.Playwright tests we also use `puppeteer/browsers`
 * to download the browsers, and `playwright` to launch them. Unfortunately, Firefox does not play nice
 * with the downloaded browsers and `playwright`, so we are forced to use `puppeteer` for Firefox.
 *
 * These tests use puppeteer to automate js-randomness-predictor usage in a browser (firefox in this case).
 * We test older versions all the way to newer versions to ensure all of our solving strategies work.
 *
 * This helps us be more proactive in detecting changes that break our predictor. Prior to this
 * I had to manually test the firefox predicttor using rands generated in an updated version of Firefox in
 * order to detect breaking changes.
 */

const BROWSER = Browser.FIREFOX;
// - BrowserTag.STABLE is the latest stable version, whatever that may be.
// - `puppeteer/browsers` uses the tags to download from here : https://archive.mozilla.org/pub/firefox/
//    I am not sure how they form the URLs tho.
const FIREFOX_VERSIONS_OR_TAGS_TO_TEST = ["stable_130.0", "stable_140.0", "stable_150.0", BrowserTag.STABLE];
const DOWNLOAD_CACHE_DIR = path.resolve("./.browser-cache/firefox");
const PLATFORM = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Fallback for CI/CD

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

describe(`Firefox : Automated Testing via Puppeteer`, async () => {
  for (const versionOrTag of FIREFOX_VERSIONS_OR_TAGS_TO_TEST) {
    const targetBuildId = await resolveBuildId(BROWSER, PLATFORM, versionOrTag);

    let testTitle = `firefox ${targetBuildId} accurately predicts using dynamic generated values`;
    if (versionOrTag === BrowserTag.STABLE) {
      testTitle = `[newest release] ${testTitle}`;
    }

    it(testTitle, async () => {
      const buildInfo = await install({
        browser: BROWSER,
        buildId: targetBuildId,
        cacheDir: DOWNLOAD_CACHE_DIR,
      });

      const executablePath = computeExecutablePath({
        browser: BROWSER,
        buildId: buildInfo.buildId,
        cacheDir: DOWNLOAD_CACHE_DIR,
      });

      const firefox = await puppeteer.launch({
        browser: BROWSER,
        executablePath,
        headless: true,
      });

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
  }
});

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
