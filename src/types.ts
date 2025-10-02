import JSRandomnessPredictor from "./index.js";
import { BitVec, Solver, Context, Z3HighLevel, Z3LowLevel } from "z3-solver-jsrp";

/*********************************************************************************************************
 * CONSTANTS
 *********************************************************************************************************/

/** The env var KEY (not the value) that determines which runtime the CLI uses. */
export const EXECUTION_RUNTIME_ENV_VAR_KEY = "JSRP_RUNTIME";
export const DEFAULT_NUMBER_OF_PREDICTIONS = 10;
export const V8_MAX_PREDICTIONS = 64;
export const NODE_MAJOR_VERSIONS = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] as const;
export const RUNTIMES = ["node", "bun", "deno", "chrome", "firefox", "safari"] as const;
export const SERVER_RUNTIMES = ["node", "bun", "deno"] as const;
export const BROWSER_RUNTIMES = ["chrome", "safari", "firefox"] as const;
export const JAVASCRIPT_ENGINES = ["v8", "javascriptcore", "spidermonkey"] as const;

export const IS_SERVER_RUNTIME: Record<RuntimeType, boolean> = Object.fromEntries(
  RUNTIMES.map((r: RuntimeType) => [r, SERVER_RUNTIMES.includes(r as ServerRuntimeType)]),
) as Record<RuntimeType, boolean>;

export const IS_BROWSER_RUNTIME: Record<RuntimeType, boolean> = Object.fromEntries(
  RUNTIMES.map((r: RuntimeType) => [r, BROWSER_RUNTIMES.includes(r as BrowserRuntimeType)]),
) as Record<RuntimeType, boolean>;

export const JAVASCRIPT_ENGINE_REQUIRED_SEQUENCE_LENGTH: Record<EngineType, number> = {
  v8: 4,
  javascriptcore: 6, // TODO: update when bug fix lands
  spidermonkey: 4,
} as const;

// Get engine from runtime
export const RUNTIME_ENGINE: Record<RuntimeType, EngineType> = {
  node: "v8",
  bun: "javascriptcore",
  deno: "v8",
  chrome: "v8",
  firefox: "spidermonkey",
  safari: "javascriptcore",
};

// Get runtime(s) from engine, returns [] even if only one runtime exists for an engine.
export const ENGINE_RUNTIME = Object.entries(RUNTIME_ENGINE).reduce(
  (acc, [runtime, engine]) => {
    (acc[engine] ||= []).push(runtime as RuntimeType);
    return acc;
  },
  {} as Record<EngineType, RuntimeType[]>,
);

// Get default sequence length from runtime
export const DEFAULT_SEQUENCE_LENGTH: Record<RuntimeType, number> = Object.fromEntries(
  Object.entries(RUNTIME_ENGINE).map(([runtime, engine]) => [runtime, JAVASCRIPT_ENGINE_REQUIRED_SEQUENCE_LENGTH[engine]]),
) as Record<RuntimeType, number>;

/*********************************************************************************************************
 * INTERFACES
 *********************************************************************************************************/

export interface PredictorArgs {
  environment: RuntimeType;
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
export type RuntimeType = (typeof RUNTIMES)[number];
export type EngineType = (typeof JAVASCRIPT_ENGINES)[number];
export type ServerRuntimeType = (typeof SERVER_RUNTIMES)[number];
export type BrowserRuntimeType = (typeof BROWSER_RUNTIMES)[number];
export type Predictor = ReturnType<(typeof JSRandomnessPredictor)[keyof typeof JSRandomnessPredictor]>;
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

export type PredictorResult = {
  sequence: number[];
  predictions: number[];
  actual: string | number[];
  isCorrect?: boolean;
  _warnings?: string[];
  _info?: string[];
};

export type StateConversionMap = {
  recoverMantissa: RecoverMantissaFn;
  constrainMantissa: ConstrainMantissaFn;
  toDouble: ToDoubleFn;
};
