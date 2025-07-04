import JSRandomnessPredictor from "../index.js";
import { Predictor, PredictorArgs, PredictorResult, DEFAULT_NUM_PREDICTIONS, DEFAULT_SEQUENCE_LENGTH } from "../types.js";
import { getCurrentNodeJsMajorVersion } from "./getCurrentNodeJsMajorVersion.js";

export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  try {
    // If the user provided "node" or "v8" as --environment.
    const isNodeOrV8 = argv.environment === "node" || argv.environment === "v8";
    // If the provided --env-version equals the users current running node version.
    const isNodeVersionMatch = getCurrentNodeJsMajorVersion() === argv.envVersion;

    const numPredictions = argv.predictions ? argv.predictions : DEFAULT_NUM_PREDICTIONS;
    const sequence = argv.sequence ? argv.sequence : Array.from({ length: DEFAULT_SEQUENCE_LENGTH }, Math.random);
    const predictor: Predictor = JSRandomnessPredictor[argv.environment](sequence);

    // * If the conditions below are met:
    //    We need to set the --env-version that was provided on the predictor itself.
    // * Conditions that must be met:
    //    - The --env-version is defined
    //    - The --environment is v8 OR node
    //    - The --env-version is NOT equal to the users current running node version
    if (argv.envVersion && isNodeOrV8 && !isNodeVersionMatch) {
      const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
      if (argv.environment === "v8") {
        (predictor as ReturnType<typeof JSRandomnessPredictor.v8>).setNodeVersion(v);
      } else if (argv.environment === "node") {
        (predictor as ReturnType<typeof JSRandomnessPredictor.node>).setNodeVersion(v);
      } else {
        throw new Error(`Expected '--environment' to be 'node' or 'v8'! Got '${argv.environment}'`);
      }
    }

    const predictions: number[] = [];
    for (let i = 0; i < numPredictions; i++) {
      const p = await predictor.predictNext();
      predictions.push(p);
    }

    // Default value for optional results.
    let actual: string | number[] = "You'll need to get this yourself via the same way you generated the sequence";
    let isCorrect: boolean | undefined = undefined;

    // * If the conditions below are met:
    //    We can generate the expected results and determine their accuracy.
    //    This is because we are currently running in the correct Node version.
    // * Conditions that must be met:
    //    - The --environment is v8 or node
    //    - The --sequence was NOT provided
    //    - The --env-version was not provided OR
    //      the --env-version is equal to the users current running node version
    if (isNodeOrV8 && !argv.sequence && (!argv.envVersion || isNodeVersionMatch)) {
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

    return Promise.resolve(results);
  } catch (e) {
    return Promise.reject(e);
  }
}
