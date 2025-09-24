import NodeRandomnessPredictor from "../../src/predictors/Node";
import { describe as suite, it as test } from "node:test";
import assert from "node:assert";

suite("Node", () => {
  test("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      new NodeRandomnessPredictor(Array.from({ length: 64 }, () => 0.0));
    });
  });

  test("predict correctly when using auto-generated sequence", async () => {
    const nodePredictor = new NodeRandomnessPredictor();
    const expected = Array.from({ length: 5 }, Math.random);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
