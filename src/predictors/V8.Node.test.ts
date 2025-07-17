import NodeRandomnessPredictor from "./Node";
import { describe, it } from "node:test";
import assert from "node:assert";
import randomNumberDatabase from "../../scripts/random-numbers.json";

function getSequenceAndExpectedFromDatabase(nodeJsMajorVersion: number, isCustomSeed?: boolean): { sequence: number[]; expected: number[] } {
  const found = randomNumberDatabase.find((db) => db.nodeVersion === nodeJsMajorVersion);
  if (!found) {
    throw new Error(`Unable to find random numbers for Node.js v${nodeJsMajorVersion}`);
  }
  const isSeeded = isCustomSeed === undefined ? false : isCustomSeed;
  const rands = found.randomNumbers.find((r) => r.isCustomSeed === isSeeded);
  if (!rands) {
    throw new Error(`Unable to find random numbers for Node.js v${nodeJsMajorVersion}`);
  }
  return { sequence: rands.sequence, expected: rands.expected };
}

describe("Node", () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      new NodeRandomnessPredictor(Array.from({ length: 64 }, () => 0.0));
    });
  });

  // TESTS WHATEVER CURRENT NODE VERSION YOU ARE ON
  describe(`Current Runtime Version : Dynamically Generated Sequence`, () => {
    it("predicts the next 5 numbers correctly", async () => {
      const v8 = new NodeRandomnessPredictor();
      const expected = Array.from({ length: 5 }, Math.random);
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await v8.predictNext());
      }
      assert.deepStrictEqual(expected, predictions);
    });
  });

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

  /* GITHUB ACTIONS TESTS VERSIONS 17 - CURRENT

  // TESTS NODE VERSION 22
  describe("v22.0.0 : User Provided Sequence", () => {
    // THESE NUMBERS WERE GENERATED IN NODE v22.x.x
    const USER_PROVIDED_SEQUENCE = [0.36280726230126614, 0.32726837947512855, 0.22834780314989023, 0.18295517908119385];
    const EXPECTED_NEXT_NUMBER = 0.8853110028441145;
    const EXPECTED_NEXT_FIVE_NUMBERS = [0.14326940888839124, 0.035607792006009165, 0.6491231376351401, 0.3345277284146617, 0.42618019812863417];
    const providedPredictor = new NodeRandomnessPredictor(USER_PROVIDED_SEQUENCE);
    providedPredictor.setNodeVersion({ major: 22, minor: 0, patch: 0 });

    it("should predict the next random number", async () => {
      const nextPrediction = await providedPredictor.predictNext();
      assert.deepStrictEqual(nextPrediction, EXPECTED_NEXT_NUMBER);
    });

    it("should predict the next 5 random numbers", async () => {
      const nextFive: number[] = [];
      for (let i = 0; i < EXPECTED_NEXT_FIVE_NUMBERS.length; i++) {
        nextFive.push(await providedPredictor.predictNext());
      }
      assert.deepStrictEqual(nextFive, EXPECTED_NEXT_FIVE_NUMBERS);
    });
  });

  // TESTS NODE VERSION 24+
  describe("v24.0.0 : User Provided Sequence", () => {
    // THESE NUMBERS WERE GENERATED IN NODE v24.2.0
    const USER_PROVIDED_SEQUENCE = [0.01800425609760259, 0.19267361208155598, 0.9892770985784053, 0.49553307275603264, 0.7362624704291061];
    const EXPECTED_NEXT_NUMBER = 0.8664993194151147;
    const EXPECTED_NEXT_FIVE_NUMBERS = [0.5549329443482626, 0.8879559862322086, 0.9570142746667122, 0.7514661363382521, 0.9348208735728415];

    const providedPredictor = new NodeRandomnessPredictor(USER_PROVIDED_SEQUENCE);
    providedPredictor.setNodeVersion({ major: 24, minor: 0, patch: 0 });

    it("should predict the next random number", async () => {
      const nextPrediction = await providedPredictor.predictNext();
      assert.deepStrictEqual(nextPrediction, EXPECTED_NEXT_NUMBER);
    });

    it("should predict the next 5 random numbers", async () => {
      const nextFive: number[] = [];
      for (let i = 0; i < EXPECTED_NEXT_FIVE_NUMBERS.length; i++) {
        nextFive.push(await providedPredictor.predictNext());
      }
      assert.deepStrictEqual(nextFive, EXPECTED_NEXT_FIVE_NUMBERS);
    });
  });
  */
});
