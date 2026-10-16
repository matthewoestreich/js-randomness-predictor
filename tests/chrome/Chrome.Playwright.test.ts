import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import { chromium, Page, Browser as PlaywrightBrowser } from "playwright";
import {
  computeExecutablePath,
  detectBrowserPlatform,
  resolveBuildId,
  Browser as PuppeteerBrowser,
  BrowserPlatform,
} from "@puppeteer/browsers";

/**
 * If you want to use parameters for this script you'll need to set specific env vars.
 * See the env vars below.
 *
 * If you want to use different Chrome version than you have insalled you can run this
 * script like:
 *
 * `VERSION_OR_TAG=stable CACHE_DIRECTORY=./browser-cache node thisScript.js`
 *
 * If you want to run this script with the Chrome version you have installed just do:
 *
 * `node thisScript.js`
 */

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

let chrome: PlaywrightBrowser;

if (process.env.VERSION_OR_TAG && process.env.CACHE_DIRECTORY) {
  /*
   * This "if" block is for when this test is ran via CI/CD
   */
  try {
    const browser = PuppeteerBrowser.CHROME;
    const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
    const buildId = await resolveBuildId(browser, platform, process.env.VERSION_OR_TAG);
    const executablePath = computeExecutablePath({
      browser,
      buildId,
      cacheDir: process.env.CACHE_DIRECTORY,
    });
    chrome = await chromium.launch({ executablePath, headless: true });
  } catch (err: unknown) {
    throw new Error(createSomethingWentWrongErrorMessage(err as Error));
  }
} else {
  /*
   * This "else" block is for when this test is ran locally on a devs machine
   */
  try {
    chrome = await chromium.launch({ channel: "chrome", headless: true });
    console.info(
      `\n[NOTE] We have detected you are running this test locally.\n[NOTE] We only test the version of Chrome (${chrome.version()}) you have installed!\n`,
    );
  } catch (err: unknown) {
    throw new Error(createSomethingWentWrongErrorMessage(err as Error));
  }
}

describe(`Chrome : Automated Testing via Playwright`, () => {
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

function createSomethingWentWrongErrorMessage(err: Error): string {
  return `Either something went wrong launching Chrome or you do not have it installed. Try running \`npx playwright install chrome --with-deps\` to install it.\n${(err as Error).message}`;
}

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
