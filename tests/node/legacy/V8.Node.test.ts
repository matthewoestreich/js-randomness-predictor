/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * --- !!! IMPORTANT !!! ---
 *
 * Why do we need tests for version of Node that we don't support?
 *
 * While these Node versions are unsupported by this package (due to being unable to build Z3),
 * you can still make predictions with numbers generated in those legacy versions.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

import JSRandomnessPredictor from "../../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import queryDatabase from "../../queryRandomNumbersDatabase";

describe("Node : Legacy Node.js Versions", () => {
  const runtime = "node";

  describe("v10.x : User Provided Sequence", () => {
    const runtimeVersion = 10;
    // THESE NUMBERS WERE GENERATED IN NODE v10.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v11.x : User Provided Sequence", () => {
    const runtimeVersion = 11;
    // THESE NUMBERS WERE GENERATED IN NODE v11.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v12.x : User Provided Sequence", () => {
    const runtimeVersion = 12;
    // THESE NUMBERS WERE GENERATED IN NODE v12.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v13.x : User Provided Sequence", () => {
    const runtimeVersion = 13;
    // THESE NUMBERS WERE GENERATED IN NODE v13.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v14.x : User Provided Sequence", () => {
    const runtimeVersion = 14;
    // THESE NUMBERS WERE GENERATED IN NODE v14.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v15.x : User Provided Sequence", () => {
    const runtimeVersion = 15;
    // THESE NUMBERS WERE GENERATED IN NODE v15.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
      predictor.setNodeVersion({ major: runtimeVersion, minor: 0, patch: 0 });
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        const prediction = await predictor.predictNext();
        predictions.push(prediction);
      }
      assert.deepStrictEqual(predictions, expected);
    });
  });

  describe("v16.x : User Provided Sequence", () => {
    const runtimeVersion = 16;
    // THESE NUMBERS WERE GENERATED IN NODE v16.x
    const { sequence, expected } = queryDatabase({ runtime, runtimeVersion, tags: {} });
    it("should predict accurately", async () => {
      const predictor = JSRandomnessPredictor.node(sequence);
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
