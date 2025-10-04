import { assertEquals } from "jsr:@std/assert";
import JSRandomnessPredictor from "../../dist/esm/builds/esm.js";

function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}

Deno.test("'sequence' generated with Array.from(), 'expected' generated with Math.random()", async () => {
  const sequence: number[] = Array.from({ length: 4 }, Math.random);
  const expected = callMathRandom(10);
  const predictor = JSRandomnessPredictor.deno(sequence);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await predictor.predictNext());
  }
  assertEquals(predictions, expected);
});

Deno.test("both 'sequence' and 'expected' generated with Array.from()", async () => {
  const sequence = Array.from({ length: 4 }, Math.random);
  const expected = Array.from({ length: 10 }, Math.random);
  const predictor = JSRandomnessPredictor.deno(sequence);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await predictor.predictNext());
  }
  assertEquals(predictions, expected);
});

Deno.test("both 'sequence' and 'expected' generated with Math.random()", async () => {
  const sequence = callMathRandom(4);
  const expected = callMathRandom(10);
  const predictor = JSRandomnessPredictor.deno(sequence);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await predictor.predictNext());
  }
  assertEquals(predictions, expected);
});

Deno.test("dynamically created sequence", async () => {
  const predictor = JSRandomnessPredictor.deno();
  const expected = callMathRandom(10);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await predictor.predictNext());
  }
  assertEquals(predictions, expected);
});
