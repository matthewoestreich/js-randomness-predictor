import * as z3 from "z3-solver-jsrp";
import { SemanticVersion, SolvingStrategy, Pair } from "../types.js";
import { UnexpectedRuntimeError } from "../errors.js";
import XorShift128Plus from "../XorShift128Plus.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import V8Predictor from "./engines/V8.js";

/**
 *
 *  In Node versions <= 11 the ToDouble method was different : https://github.com/nodejs/node/blob/v10.0.0/deps/v8/src/base/utils/random-number-generator.h#L114-L120
 *      ```
 *      static inline double ToDouble(uint64_t state0, uint64_t state1) {
 *         // Exponent for double values for [1.0 .. 2.0)
 *         static const uint64_t kExponentBits = uint64_t{0x3FF0000000000000};
 *         static const uint64_t kMantissaMask = uint64_t{0x000FFFFFFFFFFFFF};
 *         uint64_t random = ((state0 + state1) & kMantissaMask) | kExponentBits;
 *         return bit_cast<double>(random) - 1;
 *      }
 *      ```
 *
 *  In Node v24.x.x (commit was in Feb2025), V8 updated their impl of the `ToDouble` method. The old method was in use since 2022.
 *    This caused breaking changes to this predictor, so we now have to detect node version so we can choose which ToDouble to implement.
 *   - Old Impl: https://github.com/v8/v8/blob/e99218a1cca470ddec1931547b36a256f3450078/src/base/utils/random-number-generator.h#L111
 *      ```
 *      // Static and exposed for external use.
 *      static inline double ToDouble(uint64_t state0) {
 *        // Exponent for double values for [1.0 .. 2.0)
 *        static const uint64_t kExponentBits = uint64_t{0x3FF0000000000000};
 *        uint64_t random = (state0 >> 12) | kExponentBits;
 *        return base::bit_cast<double>(random) - 1;
 *      }
 *      ```
 *
 *   - New Impl: https://github.com/v8/v8/blob/1c3a9c08e932e87b04c7bf9ecc648e1f50d418fd/src/base/utils/random-number-generator.h#L111
 *      ```
 *      // Static and exposed for external use.
 *      static inline double ToDouble(uint64_t state0) {
 *        // Get a random [0,2**53) integer value (up to MAX_SAFE_INTEGER) by dropping
 *        // 11 bits of the state.
 *        double random_0_to_2_53 = static_cast<double>(state0 >> 11);
 *        // Map this to [0,1) by division with 2**53.
 *        constexpr double k2_53{static_cast<uint64_t>(1) << 53};
 *        return random_0_to_2_53 / k2_53;
 *      }
 *      ```
 *
 */

// See here for why MAX_SEQUENCE_LENGTH is needed: https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
const MAX_SEQUENCE_LENGTH = 64;
const DEFAULT_SEQUENCE_LENGTH = 4;

// The mantissa bits (lower 52 bits) for doubles as defined in IEEE-754
const IEEE754_MANTISSA_BITS_MASK = 0x000fffffffffffffn;

// The exponent bits (bits 52–62) for 1.0 as defined in IEEE-754 for double precision
const IEEE754_EXPONENT_BITS_MASK = 0x3ff0000000000000n;

// Map a 53-bit integer into the range [0, 1) as a double
const SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);

function getNodeVersion(): SemanticVersion {
  const [major, minor, patch] = process.versions.node.split(".").map(Number);
  return { major, minor, patch };
}

function getNodeSolvingStrategy(nodeVersion: SemanticVersion): SolvingStrategy {
  const { major } = nodeVersion;

  if (major <= 11) {
    return {
      recoverMantissa: (n: number): bigint => {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(n + 1, 0);
        return buffer.readBigUInt64LE(0) & IEEE754_MANTISSA_BITS_MASK;
      },
      toDouble: (concreteState: Pair<bigint>): number => {
        const n = concreteState[0] + concreteState[1];
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE((n & IEEE754_MANTISSA_BITS_MASK) | IEEE754_EXPONENT_BITS_MASK, 0);
        // Calculate next random number before we modify concrete state.
        return buffer.readDoubleLE(0) - 1;
      },
      constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
        const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(IEEE754_MANTISSA_BITS_MASK, 64));
        solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
      },
      symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
      concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
    };
  }

  if (major <= 23) {
    return {
      recoverMantissa: (n: number): bigint => {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(n + 1, 0);
        return buffer.readBigUInt64LE(0) & IEEE754_MANTISSA_BITS_MASK;
      },
      toDouble: (concreteState: Pair<bigint>): number => {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE((concreteState[0] >> 12n) | IEEE754_EXPONENT_BITS_MASK, 0);
        // Calculate next random number before we modify concrete state.
        return buffer.readDoubleLE(0) - 1;
      },
      constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
        solver.add(symbolicState[0].lshr(12).eq(context.BitVec.val(mantissa, 64)));
      },
      symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
      concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
    };
  }

  // Latest Node version (major version >= 24)
  return {
    recoverMantissa: (n: number): bigint => {
      const mantissa = Math.floor(n * SCALING_FACTOR_53_BIT_INT);
      return BigInt(mantissa);
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      // Calculate next random number before we modify concrete state.
      return Number(concreteState[0] >> 11n) / SCALING_FACTOR_53_BIT_INT;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      solver.add(symbolicState[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
    concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concreteBackwards(c),
  };
}

export default class NodeRandomnessPredictor extends V8Predictor {
  constructor(sequence?: number[]) {
    if (sequence && sequence.length >= MAX_SEQUENCE_LENGTH) {
      throw new Error(`sequence.length must be less than '${MAX_SEQUENCE_LENGTH}', got '${sequence.length}'`);
    }
    if (!sequence) {
      if (!ExecutionRuntime.isNode()) {
        throw new UnexpectedRuntimeError("Expected NodeJS runtime! Unable to auto-generate sequence, please provide one.");
      }
      sequence = Array.from({ length: DEFAULT_SEQUENCE_LENGTH }, Math.random);
    }
    const nodeVersion = getNodeVersion();
    const solvingStrategies = [getNodeSolvingStrategy(nodeVersion)];
    super(sequence, solvingStrategies);
  }

  setNodeVersion(version: SemanticVersion): void {
    // If the version is changed, we must set version specific methods!
    this.setSolvingStrategies([getNodeSolvingStrategy(version)]);
  }
}
