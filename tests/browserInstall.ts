import { install, detectBrowserPlatform, resolveBuildId, Browser, BrowserPlatform } from "@puppeteer/browsers";

/**
 * This script is meant to install puppeteer browsers, mostly for GitHub Actions. You can also run
 * this script locally, though.
 *
 * Use this script like:
 * `BROWSER_TYPE=chrome VERSION_OR_TAG=stable CACHE_DIRECTORY=./browser-cache npm run browser:install`
 *
 * CACHE_DIRECTORY is relative to the current working directory where the script was called from!
 * BROWSER_TYPE must be either chrome or firefox
 */

if (!process.env.BROWSER_TYPE || !process.env.VERSION_OR_TAG || !process.env.CACHE_DIRECTORY) {
  throw new Error(
    "Missing required env variable! Required env variables : process.env.BROWSER_TYPE, process.env.VERSION_OR_TAG, process.env.CACHE_DIRECTORY",
  );
}

const ALLOWED_BROWSER_TYPES = ["chrome", "firefox"];

if (!ALLOWED_BROWSER_TYPES.includes(process.env.BROWSER_TYPE)) {
  throw new Error(`Invalid process.env.BROWSER_TYPE! Must be one of ${JSON.stringify(ALLOWED_BROWSER_TYPES)}`);
}

try {
  const browser = process.env.BROWSER_TYPE === "chrome" ? Browser.CHROME : Browser.FIREFOX;
  const platform = detectBrowserPlatform() ?? BrowserPlatform.LINUX; // Safe fallback for CI environments
  const buildId = await resolveBuildId(browser, platform, process.env.VERSION_OR_TAG);

  const buildInfo = await install({
    browser,
    buildId,
    cacheDir: process.env.CACHE_DIRECTORY,
  });

  console.log(`Successfully installed browser at ${buildInfo.executablePath}\n`);
} catch (err: unknown) {
  throw new Error(`Something went wrong! ${(err as Error).message}`);
}
