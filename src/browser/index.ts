import type { BrowserRuntime, Predictor } from "../types.js";
import getCurrentBrowser from "./getCurrentBrowser.js";
import loader from "./loader.js";
import {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
} from "../predictors/index.js";

export type { BrowserRuntime, Predictor };

// IMPORTANT!! Must be called prior to using a predictor!
export const ready = () => loader();

export const node = (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence);
export const bun = (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence);
export const deno = (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence);
// prettier-ignore
export const firefox = (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence);
// prettier-ignore
export const chrome = (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence);
// prettier-ignore
export const safari = (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence);

export {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
  getCurrentBrowser,
};
