import { V8RandomnessPredictor, FirefoxRandomnessPredictor, ChromeRandomnessPredictor } from "./predictors/index.js";

export default {
  firefox(sequence: number[]) {
    return new FirefoxRandomnessPredictor(sequence);
  },
  chrome(sequence: number[]) {
    return new ChromeRandomnessPredictor(sequence);
  },
  v8(sequence?: number[]) {
    return new V8RandomnessPredictor(sequence);
  },
};
