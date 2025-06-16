import JSRandomnessPredictor from "../index.js";
import { PredictorArgs, PredictorResult, OptionalResults, SequenceNotFoundError, DEFAULT_NUM_PREDICTIONS } from "./types.js";

export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  if (!argv.sequence && argv.environment !== "v8") {
    throw new SequenceNotFoundError();
  }

  const numPredictions = argv.predictions === undefined ? DEFAULT_NUM_PREDICTIONS : argv.predictions;
  const sequence = argv.sequence === undefined ? Array.from({ length: numPredictions }, Math.random) : argv.sequence;
  const predictor = JSRandomnessPredictor[argv.environment](sequence);

  const predictions: number[] = [];
  for (let i = 0; i < numPredictions; i++) {
    predictions.push(await predictor.predictNext());
  }

  // Default value for optional results.
  const optionalResults: OptionalResults = {
    actual: "You'll need to get this yourself via the same way you generated the sequence",
  };

  // Since we are running this CLI in v8 we can automatically get the next random numbers.
  if (argv.environment === "v8") {
    optionalResults.actual = [];
    for (let i = 0; i < numPredictions; i++) {
      optionalResults.actual.push(Math.random());
    }
    // Again, since we are already in v8, we can verify results automatically.
    optionalResults.isCorrect = optionalResults.actual.every((v, i) => v === predictions[i]);
  }

  return {
    sequence,
    predictions,
    ...optionalResults,
  };
}
