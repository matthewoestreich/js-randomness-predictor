/**
 *
 * TYPES USED IN TESTS
 *
 */

export type RandomNumberGenerationMethod = "ArrayFrom" | "MathRandom";

export type SequenceAndExpectedRandoms = { sequence: number[]; expected: number[] };

export type Runtime = "deno" | "bun";

/**
 * Take Deno for example, if you want to evaluate a JS string from command line, you'd do:
 * `deno eval "console.log(1);"`
 * ...thus making "deno" the executable and "eval" the subcommand.
 */
export type RuntimeOptions = { executable: string; subcommand: string } | undefined;
