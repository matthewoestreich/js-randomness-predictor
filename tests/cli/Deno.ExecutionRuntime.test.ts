import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/constants.ts";
import queryDb from "../queryRandomNumbersDatabase.ts";

describe("Execution Runtime : Deno", () => {
  const executionRuntime = "deno";
  const environment = "deno";
  const differentEnvironment = "bun";

  it("[dynamic sequence] should not require a sequence if execution runtime matches '--environment'", () => {
    const result = callJsRandomnessPredictorCli({ environment }, { executionRuntime });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.strictEqual(jsonResult.isCorrect, true);
  });

  it("should truncate number of predictions when (sequence.length + numPredictions) > 64", () => {
    const seqLength = 4;
    const numPreds = 70;
    const expectedNumPreds = 64 - seqLength;
    const seq = Array.from({ length: seqLength }, Math.random);
    const expected = Array.from({ length: expectedNumPreds }, Math.random);
    const result = callJsRandomnessPredictorCli({ environment, sequence: seq, predictions: numPreds }, { executionRuntime });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.equal(jsonResult.predictions.length, expectedNumPreds);
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it(`should require a sequence if '--environemnt' value ('${differentEnvironment}') differs from '${EXECUTION_RUNTIME_ENV_VAR_KEY}' value (${process.env[EXECUTION_RUNTIME_ENV_VAR_KEY]})`, () => {
    const result = callJsRandomnessPredictorCli({ environment: differentEnvironment }, { executionRuntime });
    assert.throws(() => stderrThrows(result));
  });

  describe("Random Number Pool Exhaustion", () => {
    // Since Deno uses V8
    // https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    it("should trigger pool exhaustion", () => {
      const seq = Array.from({ length: 64 }, Math.random);
      const result = callJsRandomnessPredictorCli({ environment, sequence: seq }, { executionRuntime });
      // This only throws bc the sequence eats up the pool, therefore we have no room for predictions
      // so we can't even truncate predictions to fit bounds.
      assert.throws(() => stderrThrows(result));
    });

    // Normally, if an environment is specified that uses V8 under the hood, we are limited to 64 total
    // (predictions + sequence.length) due to pool exhaustion (see KNOWN_ISSUES.md).
    // This is to test that even though we are executing in an environment that has this limitation (deno),
    // but specifying an environment that does NOT have this limitation (bun), we do not trigger the limit.
    it("should NOT trigger pool exhaustion", async () => {
      const { sequence, expected } = queryDb({ runtime: "bun", tags: { sequence64: true } });
      const result = callJsRandomnessPredictorCli(
        { environment: "bun", sequence, predictions: expected.length },
        { isDryRun: true, executionRuntime },
      );
      const json = JSON.parse(result.stdout);
      assert.equal(json._warnings?.length, 0, `\n\nGOT WARNINGS:\n${json._warnings?.reduce((a: string, s: string) => (a += s + ", "), "")}\n`);
    });
  });
});
