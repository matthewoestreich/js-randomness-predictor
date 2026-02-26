import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import { V8_MAX_PREDICTIONS } from "../../src/constants.ts";

// Even though we are using Node runtime, we could use any runtime that uses V8 under the hood.
describe("Engine : V8", () => {
  it(`should allow for number of predictions + sequence length to equal V8 max predictions (${V8_MAX_PREDICTIONS})`, async () => {
    const sequence_size = 5;
    const expected_size = V8_MAX_PREDICTIONS - sequence_size;
    assert.equal(sequence_size + expected_size, V8_MAX_PREDICTIONS);
    const sequence = Array.from({ length: sequence_size }, Math.random);
    const expected = Array.from({ length: expected_size }, Math.random);
    const result = callJsRandomnessPredictorCli({ environment: "node", sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.equal(jsonResult.predictions.length + jsonResult.sequence.length, V8_MAX_PREDICTIONS);
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });
});
