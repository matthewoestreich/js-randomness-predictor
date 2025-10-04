import getCurrentBrowser from "./getCurrentBrowser.js";
import loader from "./loader.js";
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

export type { BrowserRuntimeType, Predictor, SemanticVersion };

const node = (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence);
const firefox = (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence);
const chrome = (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence);
const safari = (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence);
const bun = (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence);
const deno = (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence);

export {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
  node,
  firefox,
  chrome,
  safari,
  bun,
  deno,
  getCurrentBrowser,
};
