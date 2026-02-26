import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/constants.ts";
import { CliResult, RuntimeType } from "../../src/types.ts";

describe("Execution Runtime : Bun", () => {
  const executionRuntime: RuntimeType = "bun";
  const environment = "bun";
  const differentEnvironment = "deno";

  it("[dynamic sequence] should not require a sequence if execution runtime matches '--environment'", () => {
    const result = callJsRandomnessPredictorCli({ environment }, { executionRuntime, isDryRun: true });
    assert.doesNotThrow(() => stderrThrows(result));
  });

  it(`should require a sequence if '--environemnt' value ('${differentEnvironment}') differs from '${EXECUTION_RUNTIME_ENV_VAR_KEY}' value (${executionRuntime})`, () => {
    const result = callJsRandomnessPredictorCli({ environment: differentEnvironment }, { executionRuntime, isDryRun: true });
    assert.throws(() => stderrThrows(result));
  });

  it(`results show execution runtime type is ${executionRuntime}`, async () => {
    const result = callJsRandomnessPredictorCli({ environment }, { executionRuntime, isDryRun: true });
    const jsonResult = JSON.parse(result.stdout.toString()) as CliResult;
    const expectedRuntimeType: RuntimeType = "bun";
    assert.equal(jsonResult.runtime, expectedRuntimeType);
  });
});
