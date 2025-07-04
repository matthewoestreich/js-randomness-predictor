// prettier-ignore
import { 
  V8RandomnessPredictor, 
  FirefoxRandomnessPredictor, 
  ChromeRandomnessPredictor, 
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
} from "./predictors/index.js";

const JSRandomnessPredictor = {
  node: (sequence?: number[]) => new NodeRandomnessPredictor(sequence),
  v8: (sequence?: number[]) => new V8RandomnessPredictor(sequence),
  firefox: (sequence: number[]) => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]) => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]) => new SafariRandomnessPredictor(sequence),
};

export default JSRandomnessPredictor;
export const node = JSRandomnessPredictor.node;
export const v8 = JSRandomnessPredictor.v8;
export const firefox = JSRandomnessPredictor.firefox;
export const chrome = JSRandomnessPredictor.chrome;
export const safari = JSRandomnessPredictor.safari;
