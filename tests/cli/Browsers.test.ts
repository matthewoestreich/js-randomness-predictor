import { describe, it } from "node:test";
import assert from "node:assert";
import callJsRandomnessPredictorCli from "./callJsRandomnessPredictorCli.ts";
import queryDb from "../queryRandomNumbersDatabase.ts";
import assertProcessStatusEquals from "./assertProcessStatusEquals.ts";

describe("Browsers", () => {
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
      const expectedStatus = 1; // Expect error
      const result = callJsRandomnessPredictorCli({ environment });
      assertProcessStatusEquals(result, expectedStatus);
    });
  });

  describe("Chrome", () => {
    const environment = "chrome";
    it("enforces sequence", () => {
      const expectedStatus = 1; // Expect error
      const result = callJsRandomnessPredictorCli({ environment });
      assertProcessStatusEquals(result, expectedStatus);
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
      const expectedStatus = 1; // Expect error
      const result = callJsRandomnessPredictorCli({ environment });
      assertProcessStatusEquals(result, expectedStatus);
    });
  });
});
