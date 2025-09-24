/**
 *
 * This file is meant to test older, unsupported (meaning, unsupported by this package) versions of Node.
 *
 * While these versions are unsupported (due to being unable to build Z3), you can still
 * make predictions with numbers generated in those legacy versions.
 *
 */
import NodeRandomnessPredictor from "../../../src/predictors/Node";
import { describe as suite, it as test } from "node:test";
import assert from "node:assert";
import queryDatabase from "../../getRandomNumbersFromDatabase";

suite("Node : Legacy Node.js Versions", () => {
  const runtime = "node";

  suite("v10.x : User Provided Sequence", () => {
    const runtimeVersion = 10;
    // THESE NUMBERS WERE GENERATED IN NODE v10.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v11.x : User Provided Sequence", () => {
    const runtimeVersion = 11;
    // THESE NUMBERS WERE GENERATED IN NODE v11.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v12.x : User Provided Sequence", () => {
    const runtimeVersion = 12;
    // THESE NUMBERS WERE GENERATED IN NODE v12.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v13.x : User Provided Sequence", () => {
    const runtimeVersion = 13;
    // THESE NUMBERS WERE GENERATED IN NODE v13.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v14.x : User Provided Sequence", () => {
    const runtimeVersion = 14;
    // THESE NUMBERS WERE GENERATED IN NODE v14.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v15.x : User Provided Sequence", () => {
    const runtimeVersion = 15;
    // THESE NUMBERS WERE GENERATED IN NODE v15.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
      const predictor = new NodeRandomnessPredictor(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  suite("v16.x : User Provided Sequence", () => {
    const runtimeVersion = 16;
    // THESE NUMBERS WERE GENERATED IN NODE v16.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    test("should predict accurately", async () => {
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
