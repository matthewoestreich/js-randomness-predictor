import loader from "./loader.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import { BrowserRuntimeType } from "../types.js";
// prettier-ignore
import {
  FirefoxRandomnessPredictor, 
  ChromeRandomnessPredictor, 
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
} from "../predictors/index.js";

// Invoke immediately upon page load.
loader();

const JSRandomnessPredictor = {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
  bun: (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence),
  deno: (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence),
  getCurrentBrowser: (): BrowserRuntimeType | undefined => {
    if (ExecutionRuntime.isChrome()) {
      return "chrome";
    }
    if (ExecutionRuntime.isSafari()) {
      return "safari";
    }
    if (ExecutionRuntime.isFirefox()) {
      return "firefox";
    }
    return undefined;
  },
};

export type { SemanticVersion as NodeJsVersion } from "../types.js";

export declare const node: (sequence?: number[]) => NodeRandomnessPredictor;
export declare const firefox: (sequence: number[]) => FirefoxRandomnessPredictor;
export declare const chrome: (sequence: number[]) => ChromeRandomnessPredictor;
export declare const safari: (sequence: number[]) => SafariRandomnessPredictor;
export declare const bun: (sequence?: number[]) => BunRandomnessPredictor;
export declare const deno: (sequence?: number[]) => DenoRandomnessPredictor;
export declare const getCurrentBrowser: () => BrowserRuntimeType | undefined;

export default JSRandomnessPredictor;
