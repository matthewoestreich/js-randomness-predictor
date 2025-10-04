import loader from "./loader.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
} from "../public_types.js";

import type { BrowserRuntimeType } from "../types.js";
import type { Predictor, SemanticVersion } from "../public_types.js";

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

const JSRandomnessPredictor = {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
  bun: (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence),
  deno: (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence),
  getCurrentBrowser,
};

export type { BrowserRuntimeType, Predictor, SemanticVersion };

module.exports = JSRandomnessPredictor;
module.exports.FirefoxRandomnessPredictor = FirefoxRandomnessPredictor;
module.exports.ChromeRandomnessPredictor = ChromeRandomnessPredictor;
module.exports.NodeRandomnessPredictor = NodeRandomnessPredictor;
module.exports.SafariRandomnessPredictor = SafariRandomnessPredictor;
module.exports.BunRandomnessPredictor = BunRandomnessPredictor;
module.exports.DenoRandomnessPredictor = DenoRandomnessPredictor;
