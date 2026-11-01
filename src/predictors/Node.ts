import * as z3 from "z3-solver-jsrp";
import { SolvingStrategy, Pair } from "../types.js";
import { UnexpectedRuntimeError } from "../errors.js";
import XorShift128Plus from "../XorShift128Plus.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import V8Predictor from "./engines/V8.js";
import uint64 from "../uint64.js";
import {
  EXPONENT_BITS_MASK,
  MANTISSA_52_BITS_MASK,
  MIN_SEQUENCE_LENGTH,
  SCALING_FACTOR_53_BIT_INT,
} from "../constants.js";

// See here for why MAX_SEQUENCE_LENGTH is needed: https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
const MAX_SEQUENCE_LENGTH = 64;

// NodeJS >= v27.x.x
// Post May 2026: V8 changed Math.random cache population order.
// The PRNG algorithm/output transformation remains the same,
// but observed values now correspond to forward state progression.
const GE_V27: SolvingStrategy = {
  recoverMantissa: (n: number): bigint => {
    const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
    return BigInt(mantissa);
  },
  toDouble: (concreteState: Pair<bigint>): number => {
    const random = uint64(concreteState[0] + concreteState[1]);
    // Calculate next prediction, using first item in concrete state, before modifying concrete state.
    return Number(random >> 11n) / SCALING_FACTOR_53_BIT_INT;
  },
  constrainMantissa: (
    mantissa: bigint,
    symbolicState: Pair<z3.BitVec>,
    solver: z3.Solver,
    context: z3.Context,
  ): void => {
    const sum = symbolicState[0].add(symbolicState[1]);
    solver.add(sum.lshr(11).eq(context.BitVec.val(mantissa, 64)));
  },
  symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concrete(c),
  advanceConcreteStateBeforeProducingNextRandom: true,
};

// NodeJS version == 26.x.x
const EQ_V26: SolvingStrategy = {
  recoverMantissa: (n: number): bigint => {
    const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
    return BigInt(mantissa);
  },
  toDouble: (concreteState: Pair<bigint>): number => {
    const random = uint64(concreteState[0] + concreteState[1]);
    return Number(random >> 11n) / SCALING_FACTOR_53_BIT_INT;
  },
  constrainMantissa: (
    mantissa: bigint,
    symbolicState: Pair<z3.BitVec>,
    solver: z3.Solver,
    context: z3.Context,
  ): void => {
    const sum = symbolicState[0].add(symbolicState[1]);
    solver.add(sum.lshr(11).eq(context.BitVec.val(mantissa, 64)));
  },
  symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
  advanceConcreteStateBeforeProducingNextRandom: false,
};

// NodeJS v24 & v25
const EQ_V24_AND_V25: SolvingStrategy = {
  recoverMantissa: (n: number): bigint => {
    const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
    return BigInt(mantissa);
  },
  toDouble: (concreteState: Pair<bigint>): number => {
    // Calculate next random number before we modify concrete state.
    return Number(concreteState[0] >> 11n) / SCALING_FACTOR_53_BIT_INT;
  },
  constrainMantissa: (
    mantissa: bigint,
    symbolicState: Pair<z3.BitVec>,
    solver: z3.Solver,
    context: z3.Context,
  ): void => {
    solver.add(symbolicState[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
  },
  symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
  advanceConcreteStateBeforeProducingNextRandom: false,
};

// NodeJS v12 - v23
const EQ_V12_TO_V24: SolvingStrategy = {
  recoverMantissa: (n: number): bigint => {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleLE(n + 1, 0);
    return buffer.readBigUInt64LE(0) & MANTISSA_52_BITS_MASK;
  },
  toDouble: (concreteState: Pair<bigint>): number => {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE((concreteState[0] >> 12n) | EXPONENT_BITS_MASK, 0);
    // Calculate next random number before we modify concrete state.
    return buffer.readDoubleLE(0) - 1;
  },
  constrainMantissa: (
    mantissa: bigint,
    symbolicState: Pair<z3.BitVec>,
    solver: z3.Solver,
    context: z3.Context,
  ): void => {
    solver.add(symbolicState[0].lshr(12).eq(context.BitVec.val(mantissa, 64)));
  },
  symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
  advanceConcreteStateBeforeProducingNextRandom: false,
};

// NodeJS version <= v11
// Encountering a Node version less than or equal to v11 should be extremely rare. Therefore, this strategy
// should be last in the array. If we order the strategies array from "oldest -> newest node versions" (so we are
// less likely to receive false positives) then this strategy slows things down astronomically.
// Again, since seeing Node v11 (or earllier) should be extremely rare. We are catering to those htat are using newer
// Node versions.
const LE_V11: SolvingStrategy = {
  recoverMantissa: (n: number): bigint => {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleLE(n + 1, 0);
    return buffer.readBigUInt64LE(0) & MANTISSA_52_BITS_MASK;
  },
  toDouble: (concreteState: Pair<bigint>): number => {
    const n = concreteState[0] + concreteState[1];
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE((n & MANTISSA_52_BITS_MASK) | EXPONENT_BITS_MASK, 0);
    // Calculate next random number before we modify concrete state.
    return buffer.readDoubleLE(0) - 1;
  },
  constrainMantissa: (
    mantissa: bigint,
    symbolicState: Pair<z3.BitVec>,
    solver: z3.Solver,
    context: z3.Context,
  ): void => {
    const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(MANTISSA_52_BITS_MASK, 64));
    solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
  },
  symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
  concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
  advanceConcreteStateBeforeProducingNextRandom: false,
};

// The ordering of these strategies is important! See the comments above each strategy for more info.
// **BE CAREFUL WHEN MOVING THESE STRATS AROUND, ADDING STRATS, ETC..**
// We want to receive UNSAT as early as possible. This will help limit false positives.
const NODE_STRATEGIES: SolvingStrategy[] = [GE_V27, EQ_V26, EQ_V24_AND_V25, EQ_V12_TO_V24, LE_V11];

export default class NodeRandomnessPredictor extends V8Predictor {
  constructor(sequence?: number[]) {
    if (sequence) {
      if (sequence.length >= MAX_SEQUENCE_LENGTH) {
        throw new Error(
          `sequence.length must be less than '${MAX_SEQUENCE_LENGTH}', got '${sequence.length}'`,
        );
      }
      if (sequence.length < MIN_SEQUENCE_LENGTH.node) {
        throw new Error(
          `sequence.length must be at least '${MIN_SEQUENCE_LENGTH.node}', got '${sequence.length}'`,
        );
      }
    }

    if (!sequence) {
      if (!ExecutionRuntime.isNode()) {
        throw new UnexpectedRuntimeError(
          "Expected NodeJS runtime! Unable to auto-generate sequence, please provide one.",
        );
      }
      sequence = Array.from({ length: MIN_SEQUENCE_LENGTH.node }, Math.random);
    }

    super(sequence, NODE_STRATEGIES);
  }
}
