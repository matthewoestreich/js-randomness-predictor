import { describe, it } from "node:test";
import assert from "node:assert";
import { spawnSync, SpawnSyncReturns } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { PREDICTOR_ENVIRONMENTS } from "../constants.ts";

const BIN_PATH = path.resolve(import.meta.dirname, "../../dist/esm/cli/js-randomness-predictor.js");

type Flags = {
  environment?: NonNullable<(typeof PREDICTOR_ENVIRONMENTS)[number]>;
  envVersion?: number;
  sequence?: number[];
  predictions?: number;
};

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {Flags} flags
 */
function jsRandomnessPredictor(flags: Flags) {
  const { environment, envVersion, sequence, predictions } = flags;
  const args: string[] = [];
  if (environment) {
    args.push("-e", environment);
  }
  if (envVersion) {
    args.push("-v", envVersion.toString());
  }
  if (sequence?.length) {
    args.push("-s", ...sequence.map(String));
  }
  if (predictions) {
    args.push("-p", predictions.toString());
  }
  return spawnSync("node", [BIN_PATH, ...args], { encoding: "utf8" });
}

/**
 * Instead of just writing errors to stderr and silently continuing, we throw those errors.
 * @param {SpawnSyncReturns<T>} ssr
 */
function stderrThrows<T>(ssr: SpawnSyncReturns<T>) {
  if (ssr.stderr !== "") {
    throw new Error((ssr.stderr as String).toString());
  }
  if (ssr.error !== undefined) {
    throw ssr.error;
  }
}

describe("CLI", () => {
  it("ensures built files exist", () => {
    assert.strictEqual(fs.existsSync(BIN_PATH), true);
  });

  it(`[${PREDICTOR_ENVIRONMENTS.join("|")}] -> each don't allow '--predictions' less than or equal to 0`, () => {
    PREDICTOR_ENVIRONMENTS.forEach((e) => {
      const result = jsRandomnessPredictor({ environment: e, predictions: -1, sequence: [1, 2, 3] });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("V8/Node", () => {
    const CURR_NODE_MAJOR_VER = Number(process.versions.node.split(".")[0]);
    const environment = "v8";

    it("predicts dynamic sequence", () => {
      const result = jsRandomnessPredictor({ environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    it("should automatically provide predictions and accuracy when a sequence is not provided and env-version is not provided", () => {
      const result = jsRandomnessPredictor({ environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    it("should error when sequence is >= 64", () => {
      const seq = Array.from({ length: 64 }, Math.random);
      const result = jsRandomnessPredictor({ environment, sequence: seq });
      assert.throws(() => stderrThrows(result));
    });

    it("should truncate number of predictions when sequence.length + numPredictions > 64 and predict accurately", () => {
      const seqLength = 4;
      const numPreds = 70;
      const expectedNumPreds = 64 - seqLength;
      const seq = Array.from({ length: seqLength }, Math.random);
      const expected = Array.from({ length: expectedNumPreds }, Math.random);
      const result = jsRandomnessPredictor({ environment, sequence: seq, predictions: numPreds });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.equal(jsonResult.predictions.length, expectedNumPreds);
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    it("enforces proper node version when sequence not provided", () => {
      // We need to ensure we have a node version that is different than our current version.
      // So we get our current version, then subtract 1.
      const diffNodeMajor = CURR_NODE_MAJOR_VER - 1;
      const result = jsRandomnessPredictor({ environment, envVersion: diffNodeMajor });
      assert.throws(() => stderrThrows(result));
    });

    it("should not require a sequence if specified --env-version matches our current version", () => {
      const result = jsRandomnessPredictor({ environment, envVersion: CURR_NODE_MAJOR_VER });
      assert.doesNotThrow(() => stderrThrows(result));
    });
  });

  describe("Firefox", () => {
    const environment = "firefox";

    it("makes correct prediction(s)", () => {
      const seq = [0.1321263101773572, 0.03366887439746058, 0.032596957696410134, 0.9986575482138969];
      const exp = [
        0.8479779907956815, 0.13963871472821332, 0.25068024611907636, 0.6656237481612675, 0.7381091878692425, 0.8709382509549467, 0.49171337524788294,
        0.6991749430716799, 0.9530887478758369, 0.781511163650037, 0.699311162730038,
      ];
      const result = jsRandomnessPredictor({ environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor({ environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Chrome", () => {
    const environment = "chrome";

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor({ environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Safari", () => {
    const environment = "safari";

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor({ environment });
      assert.throws(() => stderrThrows(result));
    });
  });
});
