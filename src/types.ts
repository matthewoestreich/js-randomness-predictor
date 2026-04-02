import { BitVec, Solver, Context, Z3HighLevel, Z3LowLevel } from "z3-solver-jsrp";
import { RUNTIMES, JAVASCRIPT_ENGINES, SERVER_RUNTIMES, BROWSER_RUNTIMES, NODE_MAJOR_VERSIONS } from "./constants.js";

/*********************************************************************************************************
 * INTERFACES
 *********************************************************************************************************/

export interface Predictor {
  sequence: number[];
  predictNext(): Promise<number>;
  setNodeVersion?(version: SemanticVersion): void;
}

export interface CliArgs {
  environment: Runtime;
  sequence?: number[];
  envVersion?: NodeJsMajorVersion;
  predictions?: number;
  export?: string;
  force?: boolean; // If exporting, force file overwrite or directory structure creation.
}

/*********************************************************************************************************
 * TYPES
 *********************************************************************************************************/

export type Z3Api = Z3HighLevel & Z3LowLevel;
export type Runtime = (typeof RUNTIMES)[number];
export type Engine = (typeof JAVASCRIPT_ENGINES)[number];
export type ServerRuntime = (typeof SERVER_RUNTIMES)[number];
export type BrowserRuntime = (typeof BROWSER_RUNTIMES)[number];
export type NodeJsMajorVersion = (typeof NODE_MAJOR_VERSIONS)[number];
export type Pair<T> = [T, T];
export type SymbolicXorShiftFn = (symbolicState: Pair<BitVec>) => void;
export type ConcreteXorShiftFn = (concreteState: Pair<bigint>) => void;
export type RecoverMantissaFn = (n: number) => bigint;
export type ConstrainMantissaFn = (mantissa: bigint, symbolicState: Pair<BitVec>, solver: Solver, context: Context) => void;
export type ToDoubleFn = (concreteState: Pair<bigint>) => number;

export type SemanticVersion = {
  major: number;
  minor: number;
  patch: number;
};

export type CliResult = {
  sequence: number[];
  predictions: number[];
  actual: string | number[];
  isCorrect?: boolean;
  runtime: Runtime;
  _warnings?: string[];
  _info?: string[];
};

export type SolvingStrategy = {
  recoverMantissa: RecoverMantissaFn;
  constrainMantissa: ConstrainMantissaFn;
  toDouble: ToDoubleFn;
  symbolicXorShift: SymbolicXorShiftFn;
  concreteXorShift: ConcreteXorShiftFn;
};
