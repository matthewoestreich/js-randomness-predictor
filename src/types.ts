import JSRandomnessPredictor from "./index.js";
import { PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS } from "./constants.js";

export interface PredictorArgs {
  environment: PredictorEnvironment;
  sequence?: number[];
  envVersion?: NodeJsMajorVersion;
  predictions?: number;
  _currentNodeJsMajorVersion: NodeJsMajorVersion;
}

export type NodeJsVersion = {
  major: number;
  minor: number;
  patch: number;
};

export type Predictor = ReturnType<(typeof JSRandomnessPredictor)[keyof typeof JSRandomnessPredictor]>;
export type PredictorEnvironment = (typeof PREDICTOR_ENVIRONMENTS)[number];
export type NodeJsMajorVersion = (typeof ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS)[number];

export type PredictorResult = {
  sequence: number[];
  predictions: number[];
  actual: string | number[];
  isCorrect?: boolean;
  _warnings?: string[];
};

export type NodeJsRecoverMantissaImpl = (n: number) => bigint;
export type NodeJsConstrainMantissaImpl = (n: bigint) => void;
export type NodeJsToDoubleImpl = (n: bigint) => number;
