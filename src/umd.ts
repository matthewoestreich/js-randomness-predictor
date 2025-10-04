/**
 *
 *
 * Targets browser-based umd builds
 *
 *
 */
import loader from "./browser/loader.js";

// Invoke immediately upon page load.
loader();

export type {
  SemanticVersion,
  Predictor,
  PredictorCtor,
  PredictorCtorSequenceOptional,
  PredictorCtorSequenceRequired,
  RuntimeType,
} from "./types.js";

export { default as JSRandomnessPredictor } from "./JSRandomnessPredictor.js";
export * from "./predictors/index.js";
export { default as getCurrentBrowser } from "./browser/getCurrentBrowser.js";
