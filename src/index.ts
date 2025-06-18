import { V8RandomnessPredictor, FirefoxRandomnessPredictor, ChromeRandomnessPredictor } from "./predictors/index.js";

const JSRandomnessPredictor = {
  v8: (sequence?: number[]) => new V8RandomnessPredictor(sequence),
  firefox: (sequence: number[]) => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]) => new ChromeRandomnessPredictor(sequence),
};

// For ESM
export default JSRandomnessPredictor;
/**
 * For CJS so this will still work:
 * ```
 * const JSRandomnessPredictor = require("js-randomness-predictor");
 * // So you can still do:
 * const v8 = JSRandomnessPredictor.v8(); // same for 'chrome' and 'firefox', etc..
 * ```
 */
export const v8 = JSRandomnessPredictor.v8;
export const firefox = JSRandomnessPredictor.firefox;
export const chrome = JSRandomnessPredictor.chrome;
