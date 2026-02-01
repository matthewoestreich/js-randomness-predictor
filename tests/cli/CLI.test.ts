import { describe, it, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { RuntimeType, RUNTIMES } from "../../src/types.ts";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import queryDb from "../queryRandomNumbersDatabase.ts";

describe("Base Tests", () => {
  it(`[${RUNTIMES.join("|")}] -> each don't allow '--predictions' less than or equal to 0`, () => {
    RUNTIMES.forEach((e: RuntimeType) => {
      const result = callJsRandomnessPredictorCli({ environment: e, predictions: -1, sequence: [1, 2, 3] });
      assert.throws(() => stderrThrows(result));
    });
  });
});

describe("Export Predictor Results", () => {
  const environment = "node";
  const relativeExportPath = "./export.json"; // Relative to current working directory
  const absoluteExportPath = path.resolve(process.cwd(), relativeExportPath);
  // To test for when directory in path doesn't exist
  const extendedRelativePath = "./export/export.json"; // Relative to current working directory
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

  it("export results to file", () => {
    const result = callJsRandomnessPredictorCli({ environment, export: relativeExportPath });
    assert.doesNotThrow(() => stderrThrows(result));
    assert.ok(fs.existsSync(absoluteExportPath), "Exported file does not exist");
  });

  it("file does not get overwritten without --force", () => {
    const before = JSON.parse(fs.readFileSync(absoluteExportPath, "utf-8"));
    callJsRandomnessPredictorCli({ environment, export: relativeExportPath });
    const after = JSON.parse(fs.readFileSync(absoluteExportPath, "utf-8"));
    assert.deepEqual(before, after, `${JSON.stringify({ before, after }, null, 2)}`);
  });

  it("file is overwritten when --force is used", () => {
    const before = fs.readFileSync(absoluteExportPath, "utf-8");
    callJsRandomnessPredictorCli({ environment, export: relativeExportPath, force: true });
    const after = fs.readFileSync(absoluteExportPath, "utf-8");
    assert.notDeepStrictEqual(before, after);
  });

  it("directory does not get created when --force is not used", () => {
    callJsRandomnessPredictorCli({ environment, export: extendedRelativePath });
    assert.strictEqual(fs.existsSync(extendedAbsolutePath), false);
  });

  it("directory gets created when --force is used", () => {
    callJsRandomnessPredictorCli({ environment, export: extendedRelativePath, force: true });
    assert.strictEqual(fs.existsSync(extendedAbsolutePath), true);
  });
});

describe("Firefox", () => {
  const environment = "firefox";
  const runtime = "firefox";

  it("makes correct prediction(s)", () => {
    const { sequence, expected } = queryDb({ runtime, tags: {} });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it("enforces sequence", () => {
    const result = callJsRandomnessPredictorCli({ environment });
    assert.throws(() => stderrThrows(result));
  });
});

describe("Chrome", () => {
  const environment = "chrome";
  it("enforces sequence", () => {
    const result = callJsRandomnessPredictorCli({ environment });
    assert.throws(() => stderrThrows(result));
  });

  it(`should predict accurately using numbers after Jan 2026 update`, async () => {
    const { sequence, expected } = queryDb({ runtime: environment, tags: { afterJanuary2026Update: true } });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });
});

describe("Safari", () => {
  const environment = "safari";
  it("enforces sequence", () => {
    const result = callJsRandomnessPredictorCli({ environment });
    assert.throws(() => stderrThrows(result));
  });
});

describe("Bun", () => {
  const environment = "bun";
  const runtime = "bun";

  it("should be correct when using Array.fom", async () => {
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

describe("Deno", () => {
  const environment = "deno";
  const runtime = "deno";

  it("should be correct when using Array.fom generated in REPL", async () => {
    // NUMBERS WERE GENERATED USING `Array.from({ length N }, Math.random)` CALLS IN DENO REPL.
    const { sequence, expected } = queryDb({ runtime, tags: { arrayFrom: true, repl: true } });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    // NUMBERS WERE GENERATED USING SINGLE `Math.random()` CALLS IN DENO REPL
    const { sequence, expected } = queryDb({ runtime, tags: { mathRandomStandalone: true, repl: true } });
    const result = callJsRandomnessPredictorCli({ environment, sequence, predictions: expected.length });
    const jsonResult = JSON.parse(result.stdout.toString());
    assert.deepStrictEqual(jsonResult.predictions, expected);
  });
});
