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

function getCurrentBrowser(): BrowserRuntimeType | undefined {
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
}

export type { SemanticVersion as NodeJsVersion } from "../types.js";

export default {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
  bun: (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence),
  deno: (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence),
  getCurrentBrowser,
};
