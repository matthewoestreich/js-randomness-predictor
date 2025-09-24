import JSRandomnessPredictor from "./index.js";
import { PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS } from "./constants.js";
import { BitVec, Solver, Context } from "z3-solver";

export interface PredictorArgs {
  environment: PredictorEnvironment;
  sequence?: number[];
  envVersion?: NodeJsMajorVersion;
  predictions?: number;
  export?: string;
  force?: boolean; // If exporting, force file overwrite.
  _currentNodeJsMajorVersion: NodeJsMajorVersion;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JSRandomnessPredictorCliArgs extends Omit<PredictorArgs, "_currentNodeJsMajorVersion"> {}

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
  _info?: string[];
};

export type Pair<T> = [T, T];

export type SymbolicXorShiftImpl = (symbolicState: Pair<BitVec>) => void;
export type ConcreteXorShiftImpl = (concreteState: Pair<bigint>) => void;
export type NodeJsRecoverMantissaImpl = (n: number) => bigint;
export type NodeJsConstrainMantissaImpl = (n: bigint, symbolicState: Pair<BitVec>, solver: Solver, context: Context) => void;
export type NodeJsToDoubleImpl = (concreteState: Pair<bigint>) => number;

export type NodeJsVersionSpecificMethods = {
  recoverMantissa: NodeJsRecoverMantissaImpl;
  constrainMantissa: NodeJsConstrainMantissaImpl;
  toDouble: NodeJsToDoubleImpl;
};
