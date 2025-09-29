import { describe, it } from "node:test";
import assert from "node:assert";
import { NODE_MAJOR_VERSIONS, NodeJsMajorVersion } from "../../src/types.ts";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import queryDb from "../queryRandomNumbersDatabase.ts";

describe("Node", () => {
  const CURR_NODE_MAJOR_VER = Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
  const environment = "node";

  it("[dynamic sequence] should not require a sequence if execution runtime (and version) match '--environment' and '--env-version'", () => {
    const result = callJsRandomnessPredictorCli({ environment });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.ok(jsonResult.isCorrect === true);
  });

  it("should truncate number of predictions when (sequence.length + numPredictions) > 64", () => {
    const seqLength = 4;
    const numPreds = 70;
    const expectedNumPreds = 64 - seqLength;
    const seq = Array.from({ length: seqLength }, Math.random);
    const expected = Array.from({ length: expectedNumPreds }, Math.random);
    const result = callJsRandomnessPredictorCli({ environment, sequence: seq, predictions: numPreds });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.equal(jsonResult.predictions.length, expectedNumPreds);
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it("enforces proper node version when sequence not provided", () => {
    // We need to ensure we have a node version than the current execution runtime.
    let diffNodeMajor: NodeJsMajorVersion | undefined;
    for (let i = NODE_MAJOR_VERSIONS.length - 1; i >= 0; i--) {
      diffNodeMajor = NODE_MAJOR_VERSIONS[i];
      if (diffNodeMajor !== CURR_NODE_MAJOR_VER) {
        break;
      }
    }
    assert.ok(diffNodeMajor);
    const result = callJsRandomnessPredictorCli({ environment, envVersion: diffNodeMajor });
    assert.throws(() => stderrThrows(result));
  });

  it("should not require a sequence if specified --env-version matches current execution runtime version", () => {
    const result = callJsRandomnessPredictorCli({ environment, envVersion: CURR_NODE_MAJOR_VER });
    assert.doesNotThrow(() => stderrThrows(result));
  });

  describe("Random Number Pool Exhaustion", () => {
    // https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    it("should trigger pool exhaustion", () => {
      const seq = Array.from({ length: 64 }, Math.random);
      const result = callJsRandomnessPredictorCli({ environment, sequence: seq });
      // This only throws bc the sequence eats up the pool, therefore we have no room for predictions
      // so we can't even truncate predictions to fit bounds.
      assert.throws(() => stderrThrows(result));
    });

    // Normally, if an environment is specified that uses V8 under the hood, we are limited to 64 total
    // (predictions + sequence.length) due to pool exhaustion (see KNOWN_ISSUES.md).
    // This is to test that even though we are executing in an environment that has this limitation (node),
    // but specifying an environment that does NOT have this limitation (bun), we do not trigger the limit.
    it("should NOT trigger pool exhaustion", async () => {
      const { sequence, expected } = queryDb({ runtime: "bun", tags: { sequence64: true } });
      const result = callJsRandomnessPredictorCli({ environment: "bun", sequence, predictions: expected.length }, { isDryRun: true });
      const json = JSON.parse(result.stdout);
      assert.equal(json._warnings?.length, 0, `\n\nGOT WARNINGS:\n${json._warnings?.reduce((a: string, s: string) => (a += s + ", "), "")}\n`);
    });
  });
});
