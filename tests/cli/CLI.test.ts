import { describe, it } from "node:test";
import assert from "node:assert";
import { spawnSync, SpawnSyncReturns } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { PREDICTOR_ENVIRONMENTS } from "../../src/constants.ts";

const BIN_PATH = path.resolve(import.meta.dirname, "../../dist/esm/cli/js-randomness-predictor.js");

type Flags = {
  environment: NonNullable<(typeof PREDICTOR_ENVIRONMENTS)[number]>;
  envVersion?: number;
  sequence?: number[];
  predictions?: number;
};

/**
 * Programmatically call js-randomness-predictor CLI
 * @param {string} jsRandomnessPredictorCliPath : path to js-randomness-predictor.js script
 * @param {Flags} flags
 */
function jsRandomnessPredictor(jsRandomnessPredictorCliPath: string, flags: Flags) {
  const { environment, envVersion, sequence, predictions } = flags;
  const args: string[] = ["-e", environment];
  if (envVersion) {
    args.push("-v", envVersion.toString());
  }
  if (sequence?.length) {
    args.push("-s", ...sequence.map(String));
  }
  if (predictions) {
    args.push("-p", predictions.toString());
  }
  return spawnSync("node", [jsRandomnessPredictorCliPath, ...args], { encoding: "utf8" });
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
      const result = jsRandomnessPredictor(BIN_PATH, { environment: e, predictions: -1, sequence: [1, 2, 3] });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Node", () => {
    const CURR_NODE_MAJOR_VER = Number(process.versions.node.split(".")[0]);
    const environment = "node";

    it("predicts dynamic sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    it("should automatically provide predictions and accuracy when a sequence is not provided and env-version is not provided", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

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

    it("enforces proper node version when sequence not provided", () => {
      // We need to ensure we have a node version that is different than our current version.
      // So we get our current version, then subtract 1.
      const diffNodeMajor = CURR_NODE_MAJOR_VER - 1;
      const result = jsRandomnessPredictor(BIN_PATH, { environment, envVersion: diffNodeMajor });
      assert.throws(() => stderrThrows(result));
    });

    it("should not require a sequence if specified --env-version matches our current version", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment, envVersion: CURR_NODE_MAJOR_VER });
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
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Chrome", () => {
    const environment = "chrome";

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Safari", () => {
    const environment = "safari";

    it("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  describe("Bun", () => {
    const environment = "bun";

    it("should be correct when using Array.fom", async () => {
      // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS.
      const seq = [0.1584019859484701, 0.5889908981279809, 0.5707594257373063, 0.2013679022755892];
      const exp = [
        0.22608010770344233, 0.6271766206083508, 0.982945852940786, 0.17311426646362216, 0.7612493609526688, 0.36855644622412276, 0.16106664697250717,
        0.4819446119083074, 0.28600821056136283, 0.48136520285701956,
      ];
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("should be correct when using Math.random() standalone calls", async () => {
      // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS.
      const seq = [0.1399695243228144, 0.2014387671401643, 0.5305147829755276, 0.40869883030943166];
      const exp = [
        0.7208689709272236, 0.25435595786540255, 0.4120472933967687, 0.9931906335355927, 0.3605072878681843, 0.07740883327663006, 0.3845007845910927,
        0.0006116039135406481, 0.7945175319163787, 0.2676487652727588,
      ];
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("should be correct when using Array.fom generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS IN BUN REPL.
      const seq = [0.1879561997434812, 0.9696638899742118, 0.8999015831921182, 0.15767627277617247];
      const exp = [
        0.8814891927586603, 0.26957741879551234, 0.0662280044493414, 0.5203060860154335, 0.7156866413771543, 0.3395674692265831, 0.43468239915797724,
        0.45853673597361955, 0.2725801467208847, 0.881593673939987,
      ];
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });

    it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS IN BUN REPL
      const seq = [0.2706624766889473, 0.527873627815387, 0.19488653995655314, 0.5975612586430014];
      const exp = [
        0.19006852635524452, 0.5603843306948109, 0.10325369385339978, 0.550933841219919, 0.7839207772284974, 0.2387365891076061, 0.5578411892707478,
        0.8566587007257023, 0.359662000709565, 0.5298349140555374,
      ];
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq, predictions: exp.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, exp);
    });
  });
});
