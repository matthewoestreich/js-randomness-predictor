import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import { withRetries } from "../withRetries.js";

const RANDOM_NUMBERS_FILE_PATH = process.env.RANDOM_NUMBERS_FILE_PATH;
assert.ok(RANDOM_NUMBERS_FILE_PATH, "Missing 'process.env.RANDOM_NUMBERS_FILE_PATH'");

const randomNumbersRaw = fs.readFileSync(RANDOM_NUMBERS_FILE_PATH, "utf8");
const randomNumbers = JSON.parse(randomNumbersRaw);
const version = randomNumbers && randomNumbers.version ? `: ${randomNumbers.version}` : "";

/*
            const sequence = Array.from({ length: 5 }, Math.random);
            const expected = Array.from({ length: 10 }, Math.random);
            const rands = { version: process.version, sequence, expected };
*/

describe(`Node ${version}`, () => {
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
