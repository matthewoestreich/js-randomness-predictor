import nodefs from "node:fs";
import nodepath from "node:path";
import { PredictorArgs, PredictorResult } from "../types.js";

export default function exportResult(argv: PredictorArgs, result: PredictorResult): void {
  const exportPath = nodepath.resolve(process.cwd(), argv.export!.toString());
  const dirPath = nodepath.dirname(exportPath);
  const fileExists = nodefs.existsSync(exportPath);
  const dirExists = nodefs.existsSync(dirPath);

  if (fileExists && !nodefs.statSync(exportPath).isFile()) {
    result._warnings?.push(`Export path must be to a file! ${exportPath}`);
    return;
  }

  if (nodepath.extname(exportPath) !== ".json") {
    result._warnings?.push(`Export path must be to a .json file! ${exportPath}`);
    return;
  }

  if (fileExists && !argv.force) {
    result._warnings?.push(`Export path already exists and '--force' was not used! Use '--force' to overwrite existing files.`);
    return;
  }

  if (!dirExists && !argv.force) {
    result._warnings?.push(
      `One or more directories does not exist in export path and '--force' was not used! Use '--force' to create full path if it does not exist.`,
    );
    return;
  }

  if (!dirExists && argv.force) {
    nodefs.mkdirSync(dirPath, { recursive: true });
  }

  writeResultsToFile(exportPath, result);
}

/**
 * "PRIVATE" OR "NON-EXPORTED" FUNCTIONS
 */

function writeResultsToFile(path: string, result: PredictorResult): void {
  try {
    const json: PredictorResult = { sequence: result.sequence, predictions: result.predictions, actual: result.actual };
    if (result.isCorrect !== undefined) {
      json.isCorrect = result.isCorrect;
    }
    nodefs.writeFileSync(path, JSON.stringify(json, null, 2), { encoding: "utf-8" });
    result._info?.push(`Exported results to '${path}'`);
  } catch (e: unknown) {
    result._warnings?.push(`Unable to export results! ${(e as Error).message}`);
  }
}
