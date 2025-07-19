import NodeRandomnessPredictor from "../src/predictors/Node";
import { describe, it } from "node:test";
import assert from "node:assert";

describe("Node", () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      new NodeRandomnessPredictor(Array.from({ length: 64 }, () => 0.0));
    });
  });
  
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
