import { describe, it } from "node:test";
import assert from "node:assert";
import jsRandomnessPredictor from "./jsRandomnessPredictorWrapper.ts";
import stderrThrows from "./stderrThrows.ts";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../../src/types.ts";
import BIN_PATH from "./entryPointPath.ts";

describe("Bun as Execution Runtime", () => {
  const executionRuntime = "bun";
  const environment = "bun";
  const differentEnvironment = "deno";

  // Change runtime
  process.env[EXECUTION_RUNTIME_ENV_VAR_KEY] = executionRuntime;

  it("predicts dynamic sequence", () => {
    const result = jsRandomnessPredictor(BIN_PATH, { environment });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.strictEqual(jsonResult.isCorrect, true);
  });

  it(`should require a sequence if '--environemnt' value ('${differentEnvironment}') differs from '${EXECUTION_RUNTIME_ENV_VAR_KEY}' value (${process.env[EXECUTION_RUNTIME_ENV_VAR_KEY]})`, () => {
    const result = jsRandomnessPredictor(BIN_PATH, { environment: differentEnvironment });
    assert.throws(() => stderrThrows(result));
  });
});
