/**
 *
 * TYPES USED IN TESTS
 *
 */

import { RuntimeType, ServerRuntimeType } from "../src/types";

export type RandomNumberGenerationMethod = "ArrayFrom" | "MathRandom";
export type SequenceAndExpectedRandoms = { sequence: number[]; expected: number[] };

// For the callJsRandomnessPredictorCli (calling js-randomness-predictor CLI, but programmatically)
export type CliEnvironmentArgs = {
  isDryRun?: boolean;
  jsRandomnessPredictorCliPath?: string;
  executionRuntime?: ServerRuntimeType;
};

export type SequenceAndExpected = {
  sequence: number[];
  expected: number[];
};

export type RandomNumbers = {
  sequence: number[];
  expected: number[];
  tags: Tags;
};

export type Tags = { [k: string]: string | number | boolean | null | undefined };

export type DatabaseEntry = {
  runtime: RuntimeType;
  runtimeVersion: number;
  randomNumbers: RandomNumbers[];
};

export type DatabaseQuery = {
  runtime: RuntimeType;
  tags: Tags;
  runtimeVersion?: number;
};
