import type { Predictor, SemanticVersion } from "./public_types.js";
import {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
} from "./public_types.js";

export type { Predictor, SemanticVersion };

const JSRandomnessPredictor = {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
  bun: (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence),
  deno: (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence),
};

export default JSRandomnessPredictor;

// To satisfy legacy users.
export const node = JSRandomnessPredictor.node;
export const firefox = JSRandomnessPredictor.firefox;
export const chrome = JSRandomnessPredictor.chrome;
export const safari = JSRandomnessPredictor.safari;
export const bun = JSRandomnessPredictor.bun;
export const deno = JSRandomnessPredictor.deno;

export {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
};
