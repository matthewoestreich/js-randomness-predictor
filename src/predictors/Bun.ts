import * as z3 from "z3-solver-jsrp";
import { InsufficientSequenceLengthError, UnexpectedRuntimeError } from "../errors.js";
import { Pair, SolvingStrategy } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import uint64 from "../uint64.js";
import JavaScriptCorePredictor from "./engines/JavaScriptCore.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import callMathRandom from "../callMathRandom.js";

/***
 * Huge shout out https://blog.drstra.in/posts/jsc-randomness-predictor/
 **/

const MIN_SEQUENCE_LEN = 6;

// The mantissa bits (53 effective bits = 52 stored + 1 implicit) for doubles as defined in IEEE-754
const IEEE754_MANTISSA_BITS_MASK = 0x1fffffffffffffn;

// Map a 53-bit integer into the range [0, 1) as a double.
const SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);

const BUN_STRATEGIES: SolvingStrategy[] = [
  // Try with arithmetic shifts first.
  {
    recoverMantissa: (n: number): bigint => {
      return BigInt(Math.floor(n * SCALING_FACTOR_53_BIT_INT));
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      const n = uint64(concreteState[0] + concreteState[1]);
      return Number(n & IEEE754_MANTISSA_BITS_MASK) / SCALING_FACTOR_53_BIT_INT;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(IEEE754_MANTISSA_BITS_MASK, 64));
      solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolicArithmeticShiftRight(s),
    concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteArithmeticShiftRight(c),
  },
  // Try with logical shifts next.
  {
    recoverMantissa: (n: number): bigint => {
      return BigInt(Math.floor(n * SCALING_FACTOR_53_BIT_INT));
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      const n = uint64(concreteState[0] + concreteState[1]);
      return Number(n & IEEE754_MANTISSA_BITS_MASK) / SCALING_FACTOR_53_BIT_INT;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(IEEE754_MANTISSA_BITS_MASK, 64));
      solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
    concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concrete(c),
  },
];

export default class BunRandomnessPredictor extends JavaScriptCorePredictor {
  constructor(sequence?: number[]) {
    if (sequence && sequence.length < MIN_SEQUENCE_LEN) {
      throw new InsufficientSequenceLengthError(`sequence length must be >= ${MIN_SEQUENCE_LEN} : got ${sequence.length}`);
    }
    if (!sequence) {
      if (!ExecutionRuntime.isBun()) {
        throw new UnexpectedRuntimeError("Expected Bun runtime! Unable to auto-generate sequence, please provide one.");
      }
      sequence = callMathRandom(MIN_SEQUENCE_LEN);
    }
    super(sequence, BUN_STRATEGIES);
  }
}
