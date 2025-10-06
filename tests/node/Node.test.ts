import JSRandomnessPredictor from "../../dist/esm/index.js";
import { describe, it } from "node:test";
import assert from "node:assert";

describe("Node", () => {
  it("should throw an error if sequence.length >= 64", () => {
    assert.throws(() => {
      JSRandomnessPredictor.node(Array.from({ length: 64 }, () => 0.0));
    });
  });

  it("predict correctly when using Array.from for 'sequence' and 'expected'", async () => {
    const sequence = Array.from({ length: 4 }, Math.random);
    const nodePredictor = JSRandomnessPredictor.node(sequence);
    const expected = Array.from({ length: 5 }, Math.random);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });

  it("predict correctly when using single Math.random() calls for 'sequence' and 'expected'", async () => {
    const sequence = [Math.random(), Math.random(), Math.random(), Math.random()];
    const nodePredictor = JSRandomnessPredictor.node(sequence);
    const expected = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });

  it("predict correctly when using dynamic 'sequence' and Array.from for 'expected'", async () => {
    const nodePredictor = JSRandomnessPredictor.node();
    const expected = Array.from({ length: 10 }, Math.random);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });

  it("predict correctly when using dynamic 'sequence' and single Math.random() calls for 'expected'", async () => {
    const nodePredictor = JSRandomnessPredictor.node();
    const expected = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await nodePredictor.predictNext());
    }
    assert.deepStrictEqual(expected, predictions);
  });
});
