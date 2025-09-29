import { describe, it } from "node:test";
import assert from "node:assert";
import jsRandomnessPredictor from "./jsRandomnessPredictorWrapper.ts";
import stderrThrows from "./stderrThrows.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/types.ts";
import BIN_PATH from "./entryPointPath.ts";

describe("Deno as Execution Runtime", () => {
  const executionRuntime = "deno";
  const environment = "deno";
  const differentEnvironment = "bun";

  // Change runtime
  process.env[EXECUTION_RUNTIME_ENV_VAR_KEY] = executionRuntime;

  it("predicts dynamic sequence", () => {
    const result = jsRandomnessPredictor(BIN_PATH, { environment });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.strictEqual(jsonResult.isCorrect, true);
  });

  // Since Deno uses V8
  it("should error when sequence is >= 64", () => {
    const seq = Array.from({ length: 64 }, Math.random);
    const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq });
    assert.throws(() => stderrThrows(result));
  });

  it("should truncate number of predictions when sequence.length + numPredictions > 64 and predict accurately", () => {
    const seqLength = 4;
    const numPreds = 70;
    const expectedNumPreds = 64 - seqLength;
    const seq = Array.from({ length: seqLength }, Math.random);
    const expected = Array.from({ length: expectedNumPreds }, Math.random);
    const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: numPreds });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.equal(jsonResult.predictions.length, expectedNumPreds);
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it(`should require a sequence if '--environemnt' value ('${differentEnvironment}') differs from '${EXECUTION_RUNTIME_ENV_VAR_KEY}' value (${process.env[EXECUTION_RUNTIME_ENV_VAR_KEY]})`, () => {
    const result = jsRandomnessPredictor(BIN_PATH, { environment: differentEnvironment });
    assert.throws(() => stderrThrows(result));
  });
});
