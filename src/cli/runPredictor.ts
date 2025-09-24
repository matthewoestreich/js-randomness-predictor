import nodeFs from "node:fs";
import nodePath from "node:path";
import JSRandomnessPredictor from "../index.js";
import { Predictor, PredictorArgs, PredictorResult } from "../types.js";
import { DEFAULT_NUM_PREDICTIONS, DEFAULT_SEQUENCE_LENGTH, MAX_NODE_PREDICTIONS } from "../constants.js";

export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  try {
    // Default results
    const RESULT: PredictorResult = {
      actual: "You'll need to get this yourself via the same way you generated the sequence",
      sequence: argv.sequence ? argv.sequence : Array.from({ length: DEFAULT_SEQUENCE_LENGTH }, Math.random),
      isCorrect: undefined,
      predictions: [],
      _warnings: [],
      _info: [],
    };

    const isNode = argv.environment === "node";
    const isNodeVersionMatch = argv._currentNodeJsMajorVersion === argv.envVersion;

    let numPredictions = argv.predictions !== undefined ? argv.predictions : DEFAULT_NUM_PREDICTIONS;

    // * If:
    //    - '--environment' is "node"
    //    - numPredictions + sequence.length > 64
    // * Then:
    //    We cannot predict accurately.
    //    See here for why https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    if (isNode && numPredictions + RESULT.sequence.length > MAX_NODE_PREDICTIONS) {
      // Check if sequence.length by itself is >= 64. If so, that's an error bc we have no room for predictions.
      if (RESULT.sequence.length >= MAX_NODE_PREDICTIONS) {
        throw new Error(`Sequence too large! Sequence length must be less than '${MAX_NODE_PREDICTIONS}', got '${RESULT.sequence.length}'`);
      }
      const maxAllowedPredictions = MAX_NODE_PREDICTIONS - RESULT.sequence.length;
      numPredictions = maxAllowedPredictions; // Truncate predictions to fit bounds.
      RESULT._warnings!.push(
        `Exceeded max predictions!\n` +
          ` - For a sequence length of '${RESULT.sequence.length}', max number of predictions allowed is '${maxAllowedPredictions}'.\n` +
          ` - Truncated number of predictions to '${maxAllowedPredictions}'.\n` +
          ` - Why? See here : https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion`,
      );
    }

    // Make our predictor.
    const predictor: Predictor = JSRandomnessPredictor[argv.environment](RESULT.sequence);

    // * If:
    //    - The --env-version is defined
    //    - The --environment is node
    //    - The --env-version is NOT equal to the users current running node version
    // * Then:
    //    We need to set the --env-version that was provided on the predictor itself.
    if (argv.envVersion && isNode && !isNodeVersionMatch) {
      const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
      (predictor as ReturnType<typeof JSRandomnessPredictor.node>).setNodeVersion(v);
    }

    // Make predictions
    for (let i = 0; i < numPredictions; i++) {
      const p = await predictor.predictNext();
      RESULT.predictions.push(p);
    }

    // * If:
    //    - The --environment is node
    //    - The --sequence was NOT provided
    //    - The --env-version was not provided OR the --env-version is equal to the users current running node version
    // * Then:
    //    We can generate the expected results and determine their accuracy.
    //    This is because we are currently running in the correct Node version.
    if (isNode && !argv.sequence && (!argv.envVersion || isNodeVersionMatch)) {
      RESULT.actual = Array.from({ length: numPredictions }, Math.random);
      RESULT.isCorrect = RESULT.actual.every((v, i) => v === RESULT.predictions[i]);
    }

    // Export results to file.
    if (argv.export) {
      exportResult(argv, RESULT);
    }

    return Promise.resolve(RESULT);
  } catch (e) {
    return Promise.reject(e);
  }
}

function exportResult(argv: PredictorArgs, result: PredictorResult): void {
  const exportPath = nodePath.resolve(process.cwd(), argv.export!.toString());
  const dirPath = nodePath.dirname(exportPath);
  const fileExists = nodeFs.existsSync(exportPath);
  const dirExists = nodeFs.existsSync(dirPath);

  if (fileExists && !nodeFs.statSync(exportPath).isFile()) {
    result._warnings?.push(`Export path must be to a file! ${exportPath}`);
    return;
  }

  if (nodePath.extname(exportPath) !== ".json") {
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
    nodeFs.mkdirSync(dirPath, { recursive: true });
  }

  writeResultsToFile(exportPath, result);
}

function writeResultsToFile(path: string, result: PredictorResult): void {
  try {
    const json: PredictorResult = { sequence: result.sequence, predictions: result.predictions, actual: result.actual };
    if (result.isCorrect !== undefined) {
      json.isCorrect = result.isCorrect;
    }
    nodeFs.writeFileSync(path, JSON.stringify(json, null, 2), { encoding: "utf-8" });
    result._info?.push(`Exported results to '${path}'`);
  } catch (e: unknown) {
    result._warnings?.push(`Unable to export results! ${(e as Error).message}`);
  }
}
