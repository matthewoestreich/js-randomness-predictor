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

    return Promise.resolve(RESULT);
  } catch (e) {
    return Promise.reject(e);
  }
}
