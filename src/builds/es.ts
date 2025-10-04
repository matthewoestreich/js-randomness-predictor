/**
 *
 *
 * Targets browser based esm builds (React, etc..)
 *
 *
 */
import JSRandomnessPredictor from "../JSRandomnessPredictor.js";
import loader from "../browser/loader.js";

// Invoke immediately upon page load.
loader();

export type {
  SemanticVersion,
  Predictor,
  PredictorCtor,
  PredictorCtorSequenceOptional,
  PredictorCtorSequenceRequired,
  RuntimeType,
} from "../types.js";

export default JSRandomnessPredictor;

export * from "../predictors/index.js";
export { default as getCurrentBrowser } from "../browser/getCurrentBrowser.js";
