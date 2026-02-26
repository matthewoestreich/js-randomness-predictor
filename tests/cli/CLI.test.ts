import { describe, it, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { RuntimeType } from "../../src/types.ts";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import stderrThrows from "./stderrThrows.ts";
import { RUNTIMES } from "../../src/constants.ts";

describe("CLI Functionality", () => {
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
});
