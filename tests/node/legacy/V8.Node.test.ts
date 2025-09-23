/**
 *
 * This file is meant to test older, unsupported (meaning, unsupported by this package) versions of Node.
 *
 * While these versions are unsupported (due to being unable to build Z3), you can still
 * make predictions with numbers generated in those legacy versions.
 *
 */
import NodeRandomnessPredictor from "../../../src/predictors/Node";
import { describe, it } from "node:test";
import assert from "node:assert";
import randomNumberDatabase from "./randomNumbers.json";

type SequenceExpected = { sequence: number[]; expected: number[] };

/**
 * @param nodeJsMajorVersion number specifying Node js MAJOR VERSION ONLY.
 * @param numsWithCustomSeed If true, we get numbers from DB that were generated via custom seed (123).
 */
function getSequenceAndExpectedFromDatabase(nodeJsMajorVersion: number, numsWithCustomSeed?: boolean): SequenceExpected {
  const found = randomNumberDatabase.find((db) => db.nodeVersion === nodeJsMajorVersion);
  if (!found) {
    throw new Error(`Unable to find random numbers for Node.js v${nodeJsMajorVersion}`);
  }
  const seeded = numsWithCustomSeed === undefined ? false : numsWithCustomSeed;
  const rands = found.randomNumbers.find((r) => (seeded ? r.customSeed !== null : r.customSeed === null));
  if (!rands) {
    throw new Error(`Unable to find random numbers for Node.js v${nodeJsMajorVersion}`);
  }
  return { sequence: rands.sequence, expected: rands.expected };
}

describe("Node : Legacy Node.js Versions", () => {
  describe("v10.x : User Provided Sequence", () => {
    const VERSION = 10;
    // THESE NUMBERS WERE GENERATED IN NODE v10.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v11.x : User Provided Sequence", () => {
    const VERSION = 11;
    // THESE NUMBERS WERE GENERATED IN NODE v11.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v12.x : User Provided Sequence", () => {
    const VERSION = 12;
    // THESE NUMBERS WERE GENERATED IN NODE v12.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v13.x : User Provided Sequence", () => {
    const VERSION = 13;
    // THESE NUMBERS WERE GENERATED IN NODE v13.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v14.x : User Provided Sequence", () => {
    const VERSION = 14;
    // THESE NUMBERS WERE GENERATED IN NODE v14.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v15.x : User Provided Sequence", () => {
    const VERSION = 15;
    // THESE NUMBERS WERE GENERATED IN NODE v15.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(VERSION);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v16.x : User Provided Sequence", () => {
    // THESE NUMBERS WERE GENERATED IN NODE v16.x
    const { sequence, expected } = getSequenceAndExpectedFromDatabase(16);

    it("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: 16, minor: 0, patch: 0 });

      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }

      assert.deepStrictEqual(predictions, expected);
    });
  });
});
