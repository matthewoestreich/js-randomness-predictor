import JSRandomnessPredictor from "../index.js";
import { exportResult, callMathRandom, getCurrentNodeJsMajorVersion } from "./utils.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import {
  // types/interfaces
  Predictor,
  PredictorArgs,
  PredictorResult,
  // constants
  DEFAULT_NUMBER_OF_PREDICTIONS,
  V8_MAX_PREDICTIONS,
  DEFAULT_SEQUENCE_LENGTH,
  RUNTIME_ENGINE,
} from "../types.js";

export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  try {
    // Default results
    const finalResult: PredictorResult = {
      actual: "You'll need to get this yourself via the same way you generated the sequence",
      sequence: argv.sequence ? argv.sequence : callMathRandom(DEFAULT_SEQUENCE_LENGTH[argv.environment]),
      isCorrect: undefined,
      predictions: [],
      _warnings: [],
      _info: [],
    };

    // If our current execution environment is Node and it matches what the user provided as "--env-version N"
    const nodeExecutionVersionMatchesArgvVersion = ExecutionRuntime.isNode() && getCurrentNodeJsMajorVersion() === argv.envVersion;

    let numPredictions = argv.predictions !== undefined ? argv.predictions : DEFAULT_NUMBER_OF_PREDICTIONS;

    // If we are running an a runtime that is built with V8, we cannot predict accurately
    // past 64 total calls to Math.random without solving symbolic state again.
    // See here for why https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    if (RUNTIME_ENGINE[ExecutionRuntime.type()] === "v8" && numPredictions + finalResult.sequence.length > V8_MAX_PREDICTIONS) {
      // Check if sequence.length by itself is >= 64. If so, that's an error bc we have no room for predictions.
      if (finalResult.sequence.length >= V8_MAX_PREDICTIONS) {
        throw new Error(`Sequence too large! Sequence length must be less than '${V8_MAX_PREDICTIONS}', got '${finalResult.sequence.length}'`);
      }
      const numPredictionsLeft = V8_MAX_PREDICTIONS - finalResult.sequence.length;
      numPredictions = numPredictionsLeft; // Truncate predictions to fit bounds.
      finalResult._warnings!.push(
        `Exceeded max predictions!\n` +
          ` - For a sequence length of '${finalResult.sequence.length}', max number of predictions allowed is '${numPredictionsLeft}'.\n` +
          ` - Truncated number of predictions to '${numPredictionsLeft}'.\n` +
          ` - Why? See here : https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion`,
      );
    }

    // Make our predictor.
    const predictor: Predictor = JSRandomnessPredictor[argv.environment](finalResult.sequence);

    // We need to run `setNodeVersion(x)` on the current Predictor if the user provided a command
    // that includes `--environment node --env-version N`, but the Node version of the current
    // execution environment (the runtime this script is being executed in) does not match the
    // `--env-version N` provided by the user. This means the user wants to target a different
    // Node version than they are currently running.
    if (ExecutionRuntime.isNode() && argv.envVersion && argv.environment === "node" && !nodeExecutionVersionMatchesArgvVersion) {
      const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
      (predictor as ReturnType<typeof JSRandomnessPredictor.node>).setNodeVersion(v);
    }

    // Make predictions
    for (let i = 0; i < numPredictions; i++) {
      const p = await predictor.predictNext();
      finalResult.predictions.push(p);
    }

    // We may be able to auto check if predictions are accurate because we generated the sequence.
    if (!argv.sequence) {
      switch (argv.environment) {
        case "node": {
          if (ExecutionRuntime.isNode() && (!argv.envVersion || nodeExecutionVersionMatchesArgvVersion)) {
            finalResult.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "deno": {
          if (ExecutionRuntime.isDeno()) {
            finalResult.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "bun": {
          if (ExecutionRuntime.isBun()) {
            finalResult.actual = callMathRandom(numPredictions);
          }
          break;
        }
      }
    }

    // If our results object `.actual` is of type `number[]` it means
    // we can check for accuracy.
    if (Array.isArray(finalResult.actual)) {
      finalResult.isCorrect = finalResult.actual.every((v, i) => v === finalResult.predictions[i]);
    }

    // Export results to file.
    if (argv.export) {
      exportResult(argv, finalResult);
    }

    return Promise.resolve(finalResult);
  } catch (e) {
    return Promise.reject(e);
  }
}
