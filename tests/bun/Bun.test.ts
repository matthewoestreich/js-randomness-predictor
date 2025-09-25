import { describe as suite, it as test } from "node:test";
import assert from "node:assert";
import { BunRandomnessPredictor } from "../../src/predictors";
import queryDb from "../getRandomNumbersFromDatabase";
import callBun from "./callBun";

suite("Bun", () => {
  // These tests call bun from terminal to get random numbers so we can test them "dynamically".

  test("call bun from terminal : Array.from() vs Math.random()", async (thisTest) => {
    /**
     * ONCE THIS TEST **FFAAIILLLSS**, YOU KNOW THE _B_U_G_ HAS BEEN FIXED!
     */
    const result = callBun(`
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
  });

  test("call bun from terminal : Array.from()", async () => {
    const result = callBun(`
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
  });

  test("call bun from terminal : Math.random()", async (thisTest) => {
    const result = callBun(`
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
  });

  /*
  const runtime = "bun";
  test("should be correct when using Array.fom", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  test("should be correct when using Math.random() standalone calls", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  test("should be correct when using Array.fom generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });

  test("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const bun = new BunRandomnessPredictor(sequence);
    const predictions: number[] = [];
    for (let i = 0; i < expected.length; i++) {
      predictions.push(await bun.predictNext());
    }
    assert.deepStrictEqual(predictions, expected);
  });
  */
});
