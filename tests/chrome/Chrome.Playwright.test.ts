import JSRandomnessPredictor from "../../dist/esm/index.js";
import generateRandomNumbersFromPlaywrightPage from "../generateRandomNumbersFromPlaywrightPage";
import { describe, it, after } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { chromium } from "playwright";
import {
  install,
  computeExecutablePath,
  detectBrowserPlatform,
  resolveBuildId,
  Browser,
  BrowserPlatform,
  BrowserTag,
  InstalledBrowser,
} from "@puppeteer/browsers";

/**
 * These tests use playwright to automate js-randomness-predictor usage in a browser (chrome in this case).
 * We test older versions all the way to newer versions to ensure all of our solving strategies work.
 *
 * This helps us be more proactive in detecting Chrome/V8 changes that break our predictor. Prior to this
 * I had to manually test the Chrome predicttor using rands generated in an updated version of Chrome in
 * order to detect breaking changes.
 */

// "stable" is the most recent stable version, whatever that may be.
const CHROME_VERSIONS_OR_TAGS_TO_TEST = ["132", "136", "140", "145", BrowserTag.STABLE];
const DOWNLOAD_CACHE_DIR = path.resolve("./.playwright-cache-chrome");
const PLATFORM = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

describe(`Chrome : Playwright`, async () => {
  after(async () => {
    try {
      await fsPromises.access(DOWNLOAD_CACHE_DIR, fsPromises.constants.F_OK);
    } catch (_) {
      // Path doesnt exist, just silently return
      return;
    }

    try {
      await fsPromises.rm(DOWNLOAD_CACHE_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error("[Cleanup Error] Failed to delete cache folder:", error);
    }
  });

  for (const versionOrTag of CHROME_VERSIONS_OR_TAGS_TO_TEST) {
    const targetBuildId = await resolveBuildId(Browser.CHROME, PLATFORM, versionOrTag);

    it(`chrome v${targetBuildId} accurately predicts using dynamic generated values`, async () => {
      const buildInfo: string | InstalledBrowser = await install({
        browser: Browser.CHROME,
        buildId: targetBuildId,
        cacheDir: DOWNLOAD_CACHE_DIR,
      });

      const executablePath = computeExecutablePath({
        browser: Browser.CHROME,
        buildId: buildInfo.buildId,
        cacheDir: DOWNLOAD_CACHE_DIR,
      });

      const browser = await chromium.launch({ executablePath, headless: true });
      const page = await browser.newPage();

      try {
        const sequence = await generateRandomNumbersFromPlaywrightPage(page, SEQUENCE_LENGTH);
        const expected = await generateRandomNumbersFromPlaywrightPage(page, NUMBER_OF_PREDICTIONS);

        const predictor = JSRandomnessPredictor.chrome(sequence);
        const predictions = [];

        for (let i = 0; i < NUMBER_OF_PREDICTIONS; i++) {
          const prediction = await predictor.predictNext();
          predictions.push(prediction);
        }

        assert.deepStrictEqual(predictions, expected);
      } finally {
        // Clean up the browser instance
        await browser.close();
      }
    });
  }
});
