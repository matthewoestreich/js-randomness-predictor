import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/constants.ts";
import { CliResult, RuntimeType } from "../../src/types.ts";
import queryDb from "../queryRandomNumbersDatabase.ts";
import assertProcessStatusEquals from "./assertProcessStatusEquals.ts";

describe("Execution Runtime : Bun", () => {
  const runtime: RuntimeType = "bun";
  const executionRuntime: RuntimeType = "bun";
  const environment = "bun";
  const differentEnvironment = "deno";

  it("[dynamic sequence] should not require a sequence if execution runtime matches '--environment'", () => {
    const expectedStatus = 0; // Expect no error
    const result = callJsRandomnessPredictorCli({ environment }, { executionRuntime, isDryRun: true });
    assertProcessStatusEquals(result, expectedStatus);
  });

  it(`should require a sequence if '--environemnt' value ('${differentEnvironment}') differs from '${EXECUTION_RUNTIME_ENV_VAR_KEY}' value (${executionRuntime})`, () => {
    const expectedStatus = 1; // Expect error
    const result = callJsRandomnessPredictorCli({ environment: differentEnvironment }, { executionRuntime, isDryRun: true });
    assertProcessStatusEquals(result, expectedStatus);
  });

  it(`results show execution runtime type is ${executionRuntime}`, async () => {
    const result = callJsRandomnessPredictorCli({ environment }, { executionRuntime, isDryRun: true });
    const jsonResult = JSON.parse(result.stdout.toString()) as CliResult;
    const expectedRuntimeType: RuntimeType = "bun";
    assert.equal(jsonResult.runtime, expectedRuntimeType);
  });

  it("should be correct when using Array.fom", { skip: false }, async () => {
    // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS.
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true } });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls", async () => {
    // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS.
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true } });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });
});
