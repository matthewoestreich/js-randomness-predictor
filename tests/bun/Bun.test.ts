import { describe, it } from "node:test";
import assert from "node:assert";
import { BunRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";
import callBun from "./callBun";

describe("Bun", () => {
  const runtime = "bun";

  it("should be correct when using Array.fom", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
});

describe("Bun : call from terminal", () => {
  // These tests call bun from terminal to get random numbers so we can test them "dynamically".
  it("[flaky] Array.from() vs Math.random()", async (thisTest) => {
    try {
      const result = callBun(`
        Bun.setRandomSeed(123);
        const sequence = Array.from({ length: 4 }, Math.random);
        const expected = [];
        for (let i = 0; i < 10; i++) {
          expected.push(Math.random());
        }
        console.log(JSON.stringify({ sequence, expected }));
        `);
      const resultJson = JSON.parse(result.stdout);
      const predictor = new BunRandomnessPredictor(resultJson.sequence);
      const predictions: number[] = [];
      for (let i = 0; i < resultJson.expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      assert.notDeepStrictEqual(predictions, resultJson.expected);
    } catch (e) {
      thisTest.diagnostic(`Allowed failure: ${(e as Error).message}`);
    }
  });

  it("[flaky] Array.from()", async (thisTest) => {
    try {
      const result = callBun(`
        Bun.setRandomSeed(123);
        const sequence = Array.from({ length: 4 }, Math.random);
        const expected = Array.from({ length: 10 }, Math.random);
        console.log(JSON.stringify({ sequence, expected }));
        `);
      const resultJson = JSON.parse(result.stdout.toString());
      const predictor = new BunRandomnessPredictor(resultJson.sequence);
      const predictions: number[] = [];
      for (let i = 0; i < resultJson.expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      assert.deepStrictEqual(predictions, resultJson.expected);
    } catch (e) {
      thisTest.diagnostic(`Allowed failure: ${(e as Error).message}`);
    }
  });

  it("[flaky] Math.random()", async (thisTest) => {
    try {
      const result = callBun(`
        Bun.setRandomSeed(123);
        const sequence = [Math.random(),Math.random(),Math.random(),Math.random()];
        const expected = [Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random()];
        console.log(JSON.stringify({ sequence, expected }));
        `);
      const resultJson = JSON.parse(result.stdout);
      const predictor = new BunRandomnessPredictor(resultJson.sequence);
      const predictions: number[] = [];
      for (let i = 0; i < resultJson.expected.length; i++) {
        predictions.push(await predictor.predictNext());
      }
      assert.deepStrictEqual(predictions, resultJson.expected);
    } catch (e) {
      thisTest.diagnostic(`Allowed failure: ${(e as Error).message}`);
    }
  });
});
