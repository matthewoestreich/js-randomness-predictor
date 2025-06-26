import JSRandomnessPredictor from "../index.js";
import { PredictorArgs, PredictorResult, DEFAULT_NUM_PREDICTIONS, NodeJsMajorVersion } from "./types.js";

function getCurrentNodeJsMajorVersion(): NodeJsMajorVersion {
  return Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
}

export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  const numPredictions = argv.predictions === undefined ? DEFAULT_NUM_PREDICTIONS : argv.predictions;
  const sequence = argv.sequence === undefined ? Array.from({ length: 4 }, Math.random) : argv.sequence;
  const predictor = JSRandomnessPredictor[argv.environment](sequence);

  // If '--environment' is v8 and '--env-version' is defined, we need to set that version on the predictor.
  if (argv.envVersion !== undefined && argv.environment === "v8") {
    const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
    (predictor as ReturnType<typeof JSRandomnessPredictor.v8>).setNodeVersion(v);
  }

  const predictions: number[] = [];
  for (let i = 0; i < numPredictions; i++) {
    predictions.push(await predictor.predictNext());
  }

  // Default value for optional results.
  let actual: string | number[] = "You'll need to get this yourself via the same way you generated the sequence";
  let isCorrect: boolean | undefined = undefined;

  // If '--environment' is v8 and there is no sequence, and the '--env-version' was
  // not provided OR equals the current version, we can generate the sequence since
  // we are running in the correct Node version.
  if (argv.environment === "v8" && !argv.sequence && (argv.envVersion === undefined || argv.envVersion === getCurrentNodeJsMajorVersion())) {
    actual = Array.from({ length: numPredictions }, Math.random);
    isCorrect = actual.every((v, i) => v === predictions[i]);
  }

  const results: PredictorResult = {
    sequence,
    predictions,
    actual,
  };

  if (isCorrect !== undefined) {
    results.isCorrect = isCorrect;
  }

  return results;
}
