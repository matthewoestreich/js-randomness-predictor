import { describe, it } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const BIN_PATH = path.resolve(import.meta.dirname, "../../dist/esm/cli/js-randomness-predictor.js");

type RunCommandArgs = {
  environment?: "node" | "v8" | "firefox" | "chrome" | "safari";
  envVersion?: number;
  sequence?: number[];
  predictions?: number;
};

function runCommand(params: RunCommandArgs) {
  const { environment, envVersion, sequence, predictions } = params;
  let flags: any = [];
  if (environment) {
    flags.push("-e", environment);
  }
  if (envVersion) {
    flags.push("-v", envVersion.toString());
  }
  if (sequence?.length) {
    flags.push("-s");
    sequence.forEach((s) => flags.push(s));
  }
  if (predictions) {
    flags.push("-p", predictions.toString());
  }
  return spawnSync("node", [BIN_PATH, ...flags], { encoding: "utf8" });
}

describe("CLI", () => {
  it("ensures built files exist", () => {
    assert.strictEqual(fs.existsSync(BIN_PATH), true);
  });

  describe("V8/Node", () => {
    const CURR_NODE_MAJOR_VER = Number(process.versions.node.split(".")[0]);
    const environment = "v8";

    it("predicts dynamic sequence", () => {
      const result = runCommand({ environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    it("should automatically provide predictions and accuracy when a sequence is not provided and env-version is not provided", () => {
      const result = runCommand({ environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    it("should error when sequence is >= 64", () => {
      const seq = Array.from({ length: 64 }, Math.random);
      const result = runCommand({ environment, sequence: seq });
      assert.notStrictEqual(result.stderr.toString(), "");
    });

    it("should truncate number of predictions when sequence.length + numPredictions > 64 and predict accurately", () => {
      const seqLength = 4;
      const numPreds = 60;
      const expectedNumPreds = 64 - seqLength;
      const seq = Array.from({ length: seqLength }, Math.random);
      const expected = Array.from({ length: expectedNumPreds }, Math.random);
      const result = runCommand({ environment, sequence: seq, predictions: numPreds });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.equal(jsonResult.predictions.length, expectedNumPreds);
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    it("enforces proper node version when sequence not provided", () => {
      // We need to ensure we have a node version that is different than our current version.
      // So we get our current version, then subtract 1.
      const diffNodeMajor = CURR_NODE_MAJOR_VER - 1;
      const result = runCommand({ environment, envVersion: diffNodeMajor });
      // Make sure something exists on stderr. We don't want stderr.toString() to equal "".
      assert.notStrictEqual(result.stderr.toString(), "");
    });

    it("should not require a sequence if specified --env-version matches our current version", () => {
      const result = runCommand({ environment, envVersion: CURR_NODE_MAJOR_VER });
      // Expect stderr to be equal to "" (aka no error exists)
      assert.strictEqual(result.stderr.toString(), "");
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
      const result = runCommand({ environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("enforces sequence", () => {
      const result = runCommand({ environment });
      // Expect something (string) on stderr. We don't want stderr.toString() to equal "".
      assert.notStrictEqual(result.stderr.toString(), "");
    });
  });

  describe("Chrome", () => {
    const environment = "chrome";

    it("enforces sequence", () => {
      const result = runCommand({ environment });
      // Expect something (string) on stderr
      assert.strictEqual(result.stderr.toString() !== "", true);
    });
  });

  describe("Safari", () => {
    const environment = "safari";

    it("enforces sequence", () => {
      const result = runCommand({ environment });
      // Expect something (string) on stderr
      assert.strictEqual(result.stderr.toString() !== "", true);
    });
  });
});
