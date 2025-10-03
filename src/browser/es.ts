import JSRandomnessPredictor from "../JSRandomnessPredictor.js";
import loader from "./loader.js";

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
export { default as getCurrentBrowser } from "./getCurrentBrowser.js";
