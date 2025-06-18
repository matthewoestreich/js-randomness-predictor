import { V8RandomnessPredictor, FirefoxRandomnessPredictor, ChromeRandomnessPredictor } from "./predictors/index.js";

const JSRandomnessPredictor = {
  v8: (sequence?: number[]) => new V8RandomnessPredictor(sequence),
  firefox: (sequence: number[]) => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]) => new ChromeRandomnessPredictor(sequence),
};

export default JSRandomnessPredictor;
