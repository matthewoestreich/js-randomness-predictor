import JSRandomnessPredictor from "../JSRandomnessPredictor.js";
import exportResult from "./exportResults.js";
import getCurrentNodeJsMajorVersion from "./getCurrentNodeJsMajorVersion.js";
import callMathRandom from "../callMathRandom.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import { SequenceNotFoundError } from "../errors.js";
import NodeRandomnessPredictor from "../predictors/Node.js";
import {
  Predictor,
  PredictorArgs,
  PredictorResult,
  DEFAULT_NUMBER_OF_PREDICTIONS,
  V8_MAX_PREDICTIONS,
  DEFAULT_SEQUENCE_LENGTH,
  RUNTIME_ENGINE,
  EXECUTION_RUNTIME_ENV_VAR_KEY,
} from "../types.js";

/**
 * This is the "core" of our CLI.
 *
 * DRY RUN:
 *  - You can use an env var "process.env.JSRP_DRY_RUN = '1'" to only test conditions up to the point where
 *  we are about to create a predictor, but we don't actually create one.
 *  - A dry run DOES NOT RUN THE PREDICTOR, so you will not have any predictions in results.
 *
 * @param {PredictorArgs} argv : the flags used by the cli.
 * @returns {Promise<PredictorResult>}
 */
export async function runPredictor(argv: PredictorArgs): Promise<PredictorResult> {
  try {
    // If the current execution runtime does not equal '--environment' it means we can't auto generate sequence.
    if (!argv.sequence && ExecutionRuntime.type() !== argv.environment) {
      throw new SequenceNotFoundError(
        `'--sequence' is required when '--environment' is '${argv.environment}' and '${EXECUTION_RUNTIME_ENV_VAR_KEY}' is '${ExecutionRuntime.type()}'`,
      );
    }

    // If execution runtime is Node and user provided "-e node" as well as "--env-version N" without "--sequence",
    // but the current Node execution runtime version doesn't match with "--env-version N", it means we can't generate
    // a reliable sequence, so the user HAS to provide a "--sequence" argument. Let them know about this error.
    if (
      ExecutionRuntime.isNode() &&
      argv.environment === "node" &&
      argv.envVersion &&
      !argv.sequence &&
      argv.envVersion !== getCurrentNodeJsMajorVersion()
    ) {
      throw new SequenceNotFoundError(
        `'--sequence' is required when '--environment' is '${argv.environment}' and '--env-version' is different than your current Node.js version! Current Node version is '${getCurrentNodeJsMajorVersion()}' but --env-version is '${argv.envVersion}'`,
      );
    }

    // Default results
    const result: PredictorResult = {
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

    // If the user provided an '--environment' that is built with V8, we cannot predict accurately
    // past 64 total calls to Math.random without solving symbolic state again.
    // See here for why https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
    if (RUNTIME_ENGINE[argv.environment] === "v8" && numPredictions + result.sequence.length > V8_MAX_PREDICTIONS) {
      // Check if sequence.length by itself is >= 64. If so, that's an error bc we have no room for predictions.
      if (result.sequence.length >= V8_MAX_PREDICTIONS) {
        throw new Error(`Sequence too large! Sequence length must be less than '${V8_MAX_PREDICTIONS}', got '${result.sequence.length}'`);
      }
      const numPredictionsLeft = V8_MAX_PREDICTIONS - result.sequence.length;
      numPredictions = numPredictionsLeft; // Truncate predictions to fit bounds.
      result._warnings!.push(
        `Exceeded max predictions!\n` +
          ` - For a sequence length of '${result.sequence.length}', max number of predictions allowed is '${numPredictionsLeft}'.\n` +
          ` - Truncated number of predictions to '${numPredictionsLeft}'.\n` +
          ` - Why? See here : https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion`,
      );
    }

    // Return early if we are just testing conditions and don't want to actually run the predictor.
    if (process.env.JSRP_DRY_RUN === "1") {
      return result;
    }

    // Make our predictor.
    const predictor: Predictor = JSRandomnessPredictor[argv.environment](result.sequence);

    // We need to run `setNodeVersion(x)` on the current Predictor if the user provided a command
    // that includes `--environment node --env-version N`, but the Node version of the current
    // execution environment (the runtime this script is being executed in) does not match the
    // `--env-version N` provided by the user. This means the user wants to target a different
    // Node version than they are currently running.
    if (ExecutionRuntime.isNode() && argv.envVersion && argv.environment === "node" && !nodeExecutionVersionMatchesArgvVersion) {
      const v = { major: Number(argv.envVersion), minor: 0, patch: 0 };
      predictor.setNodeVersion?.(v);
    }

    // Make predictions
    for (let i = 0; i < numPredictions; i++) {
      const p = await predictor.predictNext();
      result.predictions.push(p);
    }

    // We may be able to auto check if predictions are accurate because we generated the sequence.
    if (!argv.sequence) {
      // Make sure the environment matches the runtime
      switch (argv.environment) {
        case "node": {
          if (ExecutionRuntime.isNode() && (!argv.envVersion || nodeExecutionVersionMatchesArgvVersion)) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "deno": {
          if (ExecutionRuntime.isDeno()) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
        case "bun": {
          if (ExecutionRuntime.isBun()) {
            result.actual = callMathRandom(numPredictions);
          }
          break;
        }
      }
    }

    // If our results object `.actual` is an array, it means we can check for accuracy.
    if (Array.isArray(result.actual)) {
      result.isCorrect = result.actual.every((v, i) => v === result.predictions[i]);
    }

    // Export results to file.
    if (argv.export) {
      exportResult(argv, result);
    }

    return result;
  } catch (e) {
    return Promise.reject(e);
  }
}
