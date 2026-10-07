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
    `\n[NOTE] We have detected you are running Node tests in a local dev environment.\n[NOTE] Only the currently installed Node.js version (${randomNumbers.version}) will be tested!\n`,
  );
}

describe(`Node : ${randomNumbers.version}`, () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      JSRandomnessPredictor.node(Array.from({ length: 64 }, () => 0.0));
    });
  });

  it("predicts accurately using dynamically generated random numbers", async () => {
    const MAX_RETRIES = 3;

    let sequence = randomNumbers.sequence;
    let expected = randomNumbers.expected;

    await withRetries(async (numberOfRetries: number) => {
      // If we failed, it may mean we need a longger sequence so it gives us a better shot at predicting correctly.
      // Therefore we need to remove the first N elements from the expected array (where N = numberOfRetries),
      // and push it ontoo the sequence.
      if (numberOfRetries > 0) {
        for (let i = 0; i < numberOfRetries; i++) {
          const front = expected.shift();
          if (front) {
            sequence.push(front);
          }
        }
        console.error(`Retry ${numberOfRetries}`, { sequence, expected });
      }

      const predictor = JSRandomnessPredictor.node(sequence);
      const predictions: number[] = [];

      for (let i = 0; i < randomNumbers.expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }

      assert.deepStrictEqual(expected, predictions);
    }, MAX_RETRIES);
  });
});
