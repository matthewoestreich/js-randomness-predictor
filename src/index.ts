// prettier-ignore
import { 
  V8RandomnessPredictor, 
  FirefoxRandomnessPredictor, 
  ChromeRandomnessPredictor, 
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
} from "./predictors/index.js";

export type { NodeJsVersion } from "./types.js";

const JSRandomnessPredictor = {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  v8: (sequence?: number[]): V8RandomnessPredictor => new V8RandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
};

export default JSRandomnessPredictor;
export const node = JSRandomnessPredictor.node;
export const v8 = JSRandomnessPredictor.v8;
export const firefox = JSRandomnessPredictor.firefox;
export const chrome = JSRandomnessPredictor.chrome;
export const safari = JSRandomnessPredictor.safari;
