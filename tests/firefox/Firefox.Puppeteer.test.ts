import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import puppeteer, { Page, Browser as PuppeteerBrowser } from "puppeteer";
import { computeExecutablePath, detectBrowserPlatform, resolveBuildId, Browser as PuppeteerBrowserKind, BrowserPlatform } from "@puppeteer/browsers";

const SEQUENCE_LENGTH = 4;
const NUMBER_OF_PREDICTIONS = 10;

let firefox: PuppeteerBrowser;
let firefoxVersion: string;

if (process.env.VERSION_OR_TAG && process.env.CACHE_DIRECTORY) {
  /*
   * This "if" block is for when this test is ran via CI/CD
   */
  try {
    const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
    const buildId = await resolveBuildId(PuppeteerBrowserKind.FIREFOX, platform, process.env.VERSION_OR_TAG);
    const executablePath = computeExecutablePath({
      browser: PuppeteerBrowserKind.FIREFOX,
      buildId,
      cacheDir: process.env.CACHE_DIRECTORY,
    });
    firefox = await puppeteer.launch({
      browser: PuppeteerBrowserKind.FIREFOX,
      executablePath,
      headless: true,
    });
    firefoxVersion = await firefox.version();
  } catch (err: unknown) {
    throw new Error(`Something went wrong launching Firefox!\n${(err as Error).message}`);
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
    throw new Error(
      `Either something went wrong launching Firefox or you do not have it installed. Try running \`npx puppeteer browsers install firefox\` to install it.\n${(err as Error).message}`,
    );
  }
}

describe(`Firefox : Automated Testing via Playwright`, () => {
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

async function generateRandomNumbersFromPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
