/**
 *
 *
 * Targets server-side cjs builds
 *
 *
 */
import {
  FirefoxRandomnessPredictor,
  ChromeRandomnessPredictor,
  NodeRandomnessPredictor,
  SafariRandomnessPredictor,
  BunRandomnessPredictor,
  DenoRandomnessPredictor,
} from "../predictors/index.js";

export type {
  SemanticVersion,
  Predictor,
  PredictorCtor,
  PredictorCtorSequenceOptional,
  PredictorCtorSequenceRequired,
  RuntimeType,
} from "../types.js";

module.exports = {
  node: (sequence?: number[]): NodeRandomnessPredictor => new NodeRandomnessPredictor(sequence),
  firefox: (sequence: number[]): FirefoxRandomnessPredictor => new FirefoxRandomnessPredictor(sequence),
  chrome: (sequence: number[]): ChromeRandomnessPredictor => new ChromeRandomnessPredictor(sequence),
  safari: (sequence: number[]): SafariRandomnessPredictor => new SafariRandomnessPredictor(sequence),
  bun: (sequence?: number[]): BunRandomnessPredictor => new BunRandomnessPredictor(sequence),
  deno: (sequence?: number[]): DenoRandomnessPredictor => new DenoRandomnessPredictor(sequence),
};
