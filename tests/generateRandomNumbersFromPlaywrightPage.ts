import { Page } from "playwright";

export default async function generateRandomNumbersFromPlaywrightPage(page: Page, numRands: number) {
  return await page.evaluate((count) => {
    return Array.from({ length: count }, Math.random);
  }, numRands);
}
