import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { withRetries } from "../withRetries.js";

type RandomNumbers = {
  version: string;
  sequence: number[];
  expected: number[];
};

let randomNumbers: RandomNumbers;

if (process.env.RANDOM_NUMBERS_FILE_PATH) {
  /* This "if" block is for when this test is called via CI/CD */
  const randomNumbersRaw = fs.readFileSync(process.env.RANDOM_NUMBERS_FILE_PATH, "utf8");
  randomNumbers = JSON.parse(randomNumbersRaw);
} else {
  /* This "else" block is for when someoone runs tests locally. */
  randomNumbers = {
    version: process.version,
    sequence: Array.from({ length: 5 }, Math.random),
    expected: Array.from({ length: 10 }, Math.random),
  };
  console.info(
    `\nWe have detected you are running Node tests in a local dev environment. Please note that only the currently installed Node.js version (${randomNumbers.version}) will be tested!\n`,
  );
}

describe(`Node : ${randomNumbers.version}`, () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      JSRandomnessPredictor.node(Array.from({ length: 64 }, () => 0.0));
    });
  });

  it("predicts accurately using dynamically generated random numbers", async () => {
    await withRetries(async () => {
      const predictor = JSRandomnessPredictor.node(randomNumbers.sequence);
      const predictions: number[] = [];

      for (let i = 0; i < randomNumbers.expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }

      assert.deepStrictEqual(randomNumbers.expected, predictions);
    }, 3);
  });
});
