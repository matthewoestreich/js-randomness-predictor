import * as z3 from "z3-solver-jsrp";
import { UnexpectedRuntimeError, UnsatError } from "../errors.js";
import { Pair, SolvingStrategy } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import uint64 from "../uint64.js";
import V8Predictor from "./engines/V8.js";

/**
 * ========================================================================================
 * ~ Documenting changes to the Deno Math.random algorithm ~
 * ========================================================================================
 *
 * JANUARY 2026 UPDATE (comment written on Feb 1, 2026)
 *    - See this issue : https://github.com/matthewoestreich/js-randomness-predictor/issues/25
 *    - V8 updated their Math.random implementation in the following commit:
 *        - https://source.chromium.org/chromium/_/chromium/v8/v8/+/0596ead5b04f5988d7742c2a4559637a4f81b849
 *    - AT THE TIME OF WRITING THIS COMMENT, we now first try to old algo - if we get UNSAT, we
 *      try again with the updated algo. If the updated algo produces an error, we return it.
 */

// Map a 53-bit integer into the range [0, 1) as a double.
const SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
const denoStrategies: SolvingStrategy[] = [
  // Pre Jan 2026 changes
  {
    recoverMantissa: (n: number): bigint => {
      const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
      return BigInt(mantissa);
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      // Calculate next prediction, using first item in concrete state, before modifying concrete state.
      const next = Number(concreteState[0] >> 11n) / SCALING_FACTOR_53_BIT_INT;
      // Modify concrete state.
      XorShift128Plus.concreteBackwards(concreteState);
      return next;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      solver.add(symbolicState[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  },
  // Post Jan 2026 changes
  {
    recoverMantissa: (n: number): bigint => {
      const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
      return BigInt(mantissa);
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      const random = uint64(concreteState[0] + concreteState[1]);
      // Calculate next prediction, using first item in concrete state, before modifying concrete state.
      const next = Number(random >> 11n) / SCALING_FACTOR_53_BIT_INT;
      // Modify concrete state.
      XorShift128Plus.concreteBackwards(concreteState);
      return next;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      const sum = symbolicState[0].add(symbolicState[1]);
      solver.add(sum.lshr(11).eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  },
];

export default class DenoRandomnessPredictor extends V8Predictor {
  constructor(sequence?: number[]) {
    if (!sequence) {
      if (!ExecutionRuntime.isDeno()) {
        throw new UnexpectedRuntimeError("Expected Deno runtime! Unable to auto-generate sequence, please provide one.");
      }
      sequence = Array.from({ length: 4 }, Math.random);
    }
    super(sequence, denoStrategies);
  }
}
