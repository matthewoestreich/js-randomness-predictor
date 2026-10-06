import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it, after } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { chromium, Page } from "playwright";
import { install, computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser, BrowserPlatform, BrowserTag } from "@puppeteer/browsers";

/**
 * These tests use playwright to automate js-randomness-predictor usage in a browser (chrome in this case).
 * We test older versions all the way to newer versions to ensure all of our solving strategies work.
 *
 * This helps us be more proactive in detecting Chrome/V8 changes that break our predictor. Prior to this
 * I had to manually test the Chrome predicttor using rands generated in an updated version of Chrome in
 * order to detect breaking changes.
 */

const BROWSER = Browser.CHROME;
// "stable" is the most recent stable version, whatever that may be.
// Chrome 135 is the oldest version of Chrome we support.
const CHROME_VERSIONS_OR_TAGS_TO_TEST = ["135", "136", "140", "145", BrowserTag.STABLE];
const DOWNLOAD_CACHE_DIR = path.resolve("./.playwright-cache-chrome");
const PLATFORM = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

describe(`Chrome : Automated Testing via Playwright`, async () => {
  for (const versionOrTag of CHROME_VERSIONS_OR_TAGS_TO_TEST) {
    const targetBuildId = await resolveBuildId(BROWSER, PLATFORM, versionOrTag);

    let testTitle = "";
    if (versionOrTag === BrowserTag.STABLE) {
      testTitle = `[newest release] `;
    }
    testTitle += `chrome v${targetBuildId} accurately predicts using dynamic generated values`;

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

      const chrome = await chromium.launch({ executablePath, headless: true });

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
  }

  after(async () => {
    try {
      await fsPromises.access(DOWNLOAD_CACHE_DIR, fsPromises.constants.F_OK);
    } catch (_) {
      console.info(`[Cleanup Info] directory '${DOWNLOAD_CACHE_DIR}' does not exist.`);
      return;
    }

    try {
      await fsPromises.rm(DOWNLOAD_CACHE_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error("[Cleanup Error] Failed to delete cache folder:", error);
    }
  });
});

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
