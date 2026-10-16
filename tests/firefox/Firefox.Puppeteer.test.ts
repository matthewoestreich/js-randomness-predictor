import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import puppeteer, { Page, Browser as PuppeteerBrowser } from "puppeteer";
import {
  computeExecutablePath,
  detectBrowserPlatform,
  resolveBuildId,
  Browser as PuppeteerBrowserKind,
  BrowserPlatform,
} from "@puppeteer/browsers";

/**
 * If you want to use parameters for this script you'll need to set specific env vars.
 * See the env vars below.
 *
 * If you want to use different Firefox version than you have insalled you can run this
 * script like:
 *
 * `VERSION_OR_TAG=stable CACHE_DIRECTORY=./browser-cache node thisScript.js`
 *
 * If you want to run this script with the Firefox version you have installed just do:
 *
 * `node thisScript.js`
 */

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;
const ENV_VARS = {
  // The Firefox version or tag you wish to target.
  versionOrTag: process.env.VERSION_OR_TAG,
  // The root directory where `@puppeteer/browsers` installd your browser.
  cacheDirectory: process.env.CACHE_DIRECTORY,
};

let firefox: PuppeteerBrowser;
let firefoxVersion: string;

if (ENV_VARS.versionOrTag && ENV_VARS.cacheDirectory) {
  /*
   * This "if" block is for when this test is ran via CI/CD
   */
  try {
    const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
    const buildId = await resolveBuildId(PuppeteerBrowserKind.FIREFOX, platform, ENV_VARS.versionOrTag);
    const executablePath = computeExecutablePath({
      browser: PuppeteerBrowserKind.FIREFOX,
      buildId,
      cacheDir: ENV_VARS.cacheDirectory,
    });
    firefox = await puppeteer.launch({
      browser: PuppeteerBrowserKind.FIREFOX,
      executablePath,
      headless: true,
    });
    firefoxVersion = await firefox.version();
  } catch (err: unknown) {
    throw new Error(createSomethingWentWrongErrorMessage(err as Error));
  }
} else {
  /*
   * This "else" block is for when this test is ran locally on a devs machine
   */
  try {
    firefox = await puppeteer.launch({
      browser: PuppeteerBrowserKind.FIREFOX,
      headless: true,
    });
    firefoxVersion = await firefox.version();
    console.info(
      `\n[NOTE] We have detected you are running this test locally.\n[NOTE] We only test the version of Firefox (${firefoxVersion}) you have installed!\n`,
    );
  } catch (err: unknown) {
    throw new Error(createSomethingWentWrongErrorMessage(err as Error));
  }
}

describe(`Firefox : Automated Testing via Puppeteer`, () => {
  it(`firefox ${firefoxVersion} accurately predicts using dynamic generated values`, async () => {
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

function createSomethingWentWrongErrorMessage(err: Error): string {
  return `Either something went wrong launching Firefox or you do not have it installed. Try running \`npx puppeteer browsers install firefox\` to install it.\n${(err as Error).message}`;
}

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
