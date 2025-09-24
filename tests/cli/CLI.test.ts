import { suite, test, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { PREDICTOR_ENVIRONMENTS } from "../../src/constants.ts";
import { jsRandomnessPredictor, stderrThrows } from "./utils.ts";
import queryDb from "../getRandomNumbersFromDatabase.ts";
import { NodeJsMajorVersion, PredictorEnvironment } from "../../src/types.ts";

const BIN_PATH = path.resolve(import.meta.dirname, "../../dist/esm/cli/js-randomness-predictor.js");

suite("CLI", () => {
  test("ensures built files exist", () => {
    assert.strictEqual(fs.existsSync(BIN_PATH), true);
  });

  test(`[${PREDICTOR_ENVIRONMENTS.join("|")}] -> each don't allow '--predictions' less than or equal to 0`, () => {
    PREDICTOR_ENVIRONMENTS.forEach((e: PredictorEnvironment) => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment: e, predictions: -1, sequence: [1, 2, 3] });
      assert.throws(() => stderrThrows(result));
    });
  });

  suite("Export Predictor Results", () => {
    const environment = "node";
    const relativeExportPath = "./export.json"; // Relative to current working directory
    const absoluteExportPath = path.resolve(process.cwd(), relativeExportPath);
    // To test for when directory in path doesn't exist
    const extendedRelativePath = "./export/export.json";
    const extendedAbsolutePath = path.resolve(process.cwd(), extendedRelativePath);
    const extendedAbsoluteDirPath = path.dirname(extendedAbsolutePath);

    after(() => {
      if (fs.existsSync(absoluteExportPath)) {
        fs.unlinkSync(absoluteExportPath);
      }
      if (fs.existsSync(extendedAbsoluteDirPath)) {
        fs.rmSync(extendedAbsoluteDirPath, { recursive: true, force: true });
      }
    });

    test("export results to file", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment, export: relativeExportPath });
      assert.doesNotThrow(() => stderrThrows(result));
      assert.ok(fs.existsSync(absoluteExportPath), "Exported file does not exist");
    });

    test("file does not get overwritten without --force", () => {
      const before = JSON.parse(fs.readFileSync(absoluteExportPath, "utf-8"));
      jsRandomnessPredictor(BIN_PATH, { environment, export: relativeExportPath });
      const after = JSON.parse(fs.readFileSync(absoluteExportPath, "utf-8"));
      assert.deepEqual(before, after, `${JSON.stringify({ before, after }, null, 2)}`);
    });

    test("file is overwritten when --force is used", () => {
      const before = fs.readFileSync(absoluteExportPath, "utf-8");
      jsRandomnessPredictor(BIN_PATH, { environment, export: relativeExportPath, force: true });
      const after = fs.readFileSync(absoluteExportPath, "utf-8");
      assert.notDeepStrictEqual(before, after);
    });

    test("directory does not get created when --force is not used", () => {
      jsRandomnessPredictor(BIN_PATH, { environment, export: extendedRelativePath });
      assert.strictEqual(fs.existsSync(extendedAbsolutePath), false);
    });

    test("directory gets created when --force is used", () => {
      jsRandomnessPredictor(BIN_PATH, { environment, export: extendedRelativePath, force: true });
      assert.strictEqual(fs.existsSync(extendedAbsolutePath), true);
    });
  });

  suite("Node", () => {
    const CURR_NODE_MAJOR_VER = Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
    const environment = "node";

    test("predicts dynamic sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    test("should automatically provide predictions and accuracy when a sequence is not provided and env-version is not provided", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.strictEqual(jsonResult.isCorrect, true);
    });

    test("should error when sequence is >= 64", () => {
      const seq = Array.from({ length: 64 }, Math.random);
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence: seq });
      assert.throws(() => stderrThrows(result));
    });

    test("should truncate number of predictions when sequence.length + numPredictions > 64 and predict accurately", () => {
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

    test("enforces proper node version when sequence not provided", () => {
      // We need to ensure we have a node version that is different than our current version.
      // So we get our current version, then subtract 1.
      const diffNodeMajor = (CURR_NODE_MAJOR_VER - 1) as NodeJsMajorVersion;
      const result = jsRandomnessPredictor(BIN_PATH, { environment, envVersion: diffNodeMajor });
      assert.throws(() => stderrThrows(result));
    });

    test("should not require a sequence if specified --env-version matches our current version", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment, envVersion: CURR_NODE_MAJOR_VER });
      assert.doesNotThrow(() => stderrThrows(result));
    });
  });

  suite("Firefox", () => {
    const environment = "firefox";
    const runtime = "firefox";

    test("makes correct prediction(s)", () => {
      const { sequence, expected } = queryDb({ runtime, tags: {} });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    test("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  suite("Chrome", () => {
    const environment = "chrome";
    test("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  suite("Safari", () => {
    const environment = "safari";
    test("enforces sequence", () => {
      const result = jsRandomnessPredictor(BIN_PATH, { environment });
      assert.throws(() => stderrThrows(result));
    });
  });

  suite("Bun", () => {
    const environment = "bun";
    const runtime = "bun";

    test("should be correct when using Array.fom", async () => {
      // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS.
      const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    test("should be correct when using Math.random() standalone calls", async () => {
      // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS.
      const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    test("should be correct when using Array.fom generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS IN BUN REPL.
      const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    test("should be correct when using Math.random() standalone calls generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS IN BUN REPL
      const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });
  });

  suite("Deno", () => {
    const environment = "deno";
    const runtime = "deno";

    test("should be correct when using Array.fom generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS IN DENO REPL.
      const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });

    test("should be correct when using Math.random() standalone calls generated in REPL", async () => {
      // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS IN DENO REPL
      const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
      const result = jsRandomnessPredictor(BIN_PATH, { environment, sequence, predictions: expected.length });
      const jsonResult = JSON.parse(result.stdout.toString());
      assert.deepStrictEqual(jsonResult.predictions, expected);
    });
  });
});
