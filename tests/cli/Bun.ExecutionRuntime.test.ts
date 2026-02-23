import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/constants.ts";

describe("Execution Runtime : Bun", () => {
  const executionRuntime = "bun";
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
});
