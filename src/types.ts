import JSRandomnessPredictor from "./index.js";
import { PREDICTOR_ENVIRONMENTS, ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS } from "./constants.js";
import { BitVec, Solver, Context } from "z3-solver-jsrp";

export interface PredictorArgs {
  environment: PredictorEnvironment;
  sequence?: number[];
  envVersion?: NodeJsMajorVersion;
  predictions?: number;
  export?: string;
  force?: boolean; // If exporting, force file overwrite or directory structure creation.
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

export type SymbolicXorShiftFn = (symbolicState: Pair<BitVec>) => void;
export type ConcreteXorShiftFn = (concreteState: Pair<bigint>) => void;
export type RecoverMantissaFn = (n: number) => bigint;
export type ConstrainMantissaFn = (mantissa: bigint, symbolicState: Pair<BitVec>, solver: Solver, context: Context) => void;
export type ToDoubleFn = (concreteState: Pair<bigint>) => number;

export type StateConversionMap = {
  recoverMantissa: RecoverMantissaFn;
  constrainMantissa: ConstrainMantissaFn;
  toDouble: ToDoubleFn;
};
