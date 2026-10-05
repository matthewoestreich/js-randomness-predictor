import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it, after } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs/promises";
import { chromium, Page } from "playwright";
import { install, computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser, BrowserPlatform, BrowserTag } from "@puppeteer/browsers";

/**
 * These tests use playwright to automate js-randomness-predictor usage in a browser (chrome in this case).
 * We test older versions all the way to newer versions to ensure all of our solving strategies work.
 */

// "stable" is the most recent stable version, whatever that may be.
const CHROME_VERSIONS_TO_TEST = ["136", "140", "145", BrowserTag.STABLE];
const DOWNLOAD_CACHE_DIR = path.resolve("./.playwright-cache-chrome");
const PLATFORM = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

async function getRandsFromPage(page: Page, numRands: number) {
  const rands = await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
  return rands;
}

describe(`Chrome : Playwright`, async () => {
  after(async () => {
    try {
      const exists = await fs.exists(DOWNLOAD_CACHE_DIR);
      if (!exists) {
        return;
      }
      await fs.rm(DOWNLOAD_CACHE_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error("[Cleanup Error] Failed to delete cache folder:", error);
    }
  });

  for (const versionOrTag of CHROME_VERSIONS_TO_TEST) {
    const targetBuildId = await resolveBuildId(Browser.CHROME, PLATFORM, versionOrTag);

    it(`chrome v${targetBuildId} accurately predicts using dynamic generated values`, async () => {
      const buildInfo = await install({
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
        const sequence = await getRandsFromPage(page, SEQUENCE_LENGTH);
        const expected = await getRandsFromPage(page, NUMBER_OF_PREDICTIONS);

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
