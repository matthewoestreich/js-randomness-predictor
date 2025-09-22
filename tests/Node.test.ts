import NodeRandomnessPredictor from "../src/predictors/Node";
import { describe, it } from "node:test";
import assert from "node:assert";

describe("Node", () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      new NodeRandomnessPredictor(Array.from({ length: 64 }, () => 0.0));
    });
  });

  it("predict correctly when using auto-generated sequence", async () => {
    const nodePredictor = new NodeRandomnessPredictor();
    const expected = Array.from({ length: 5 }, Math.random);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
