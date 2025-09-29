/**
 *
 * TYPES USED IN TESTS
 *
 */

import { RuntimeType } from "../src/types";

export type RandomNumberGenerationMethod = "ArrayFrom" | "MathRandom";
export type SequenceAndExpectedRandoms = { sequence: number[]; expected: number[] };
export type Runtime = "deno" | "bun";

/**
 * Take Deno for example, if you want to evaluate a JS string from command line, you'd do:
 * `deno eval "console.log(1);"`
 * ...thus making "deno" the executable and "eval" the subcommand.
 */
export type RuntimeOptions = { executable: string; subcommand: string } | undefined;

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
