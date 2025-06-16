import { V8RandomnessPredictor, FirefoxRandomnessPredictor, ChromeRandomnessPredictor } from "./predictors/index.js";

export default class JSRandomnessPredictor {
  private constructor() {}

  static firefox(sequence: number[]) {
    return new FirefoxRandomnessPredictor(sequence);
  }

  static chrome(sequence: number[]) {
    return new ChromeRandomnessPredictor(sequence);
  }

  static v8(sequence?: number[]) {
    return new V8RandomnessPredictor(sequence);
  }
}
