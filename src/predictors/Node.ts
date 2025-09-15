import * as z3 from "z3-solver";
import { NodeJsVersion, NodeJsVersionSpecificMethods, Pair } from "../types.js";
import { UnsatError } from "../errors.js";
import XorShift128Plus from "../XorShift128Plus.js";

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

export default class NodeRandomnessPredictor {
  public sequence: number[];

  // See here for why MAX_SEQUENCE_LENGTH is needed: https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
  #MAX_SEQUENCE_LENGTH = 64;
  #DEFAULT_SEQUENCE_LENGTH = 4;
  // The mantissa bits (lower 52 bits) for doubles as defined in IEEE-754
  #IEEE754_MANTISSA_BITS_MASK = 0x000fffffffffffffn;
  // The exponent bits (bits 52–62) for 1.0 as defined in IEEE-754 for double precision
  #IEEE754_EXPONENT_BITS_MASK = 0x3ff0000000000000n;
  // Map a 53-bit integer into the range [0, 1) as a double
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #xorShift = new XorShift128Plus();
  #nodeVersion = this.#getNodeVersion();
  #versionSpecificMethods: NodeJsVersionSpecificMethods;
  #isSymbolicStateSolved = false;
  #concreteState: Pair<bigint> = [0n, 0n];

  constructor(sequence?: number[]) {
    if (sequence && sequence.length >= this.#MAX_SEQUENCE_LENGTH) {
      throw new Error(`sequence.length must be less than '${this.#MAX_SEQUENCE_LENGTH}', got '${sequence.length}'`);
    }
    if (!sequence) {
      sequence = Array.from({ length: this.#DEFAULT_SEQUENCE_LENGTH }, Math.random);
    }
    this.sequence = sequence;
    this.#versionSpecificMethods = this.#getVersionSpecificMethods();
  }

  async predictNext(): Promise<number> {
    if (!this.#isSymbolicStateSolved) {
      await this.#solveSymbolicState();
    }
    // Calculate next random number before we modify concrete state.
    const next = this.#versionSpecificMethods.toDouble(this.#concreteState);
    // Modify concrete state.
    this.#xorShift.concreteBackwards(this.#concreteState);
    return next;
  }

  setNodeVersion(version: NodeJsVersion): void {
    this.#nodeVersion = version;
    // If the version is changed, we must set version specific methods!
    this.#versionSpecificMethods = this.#getVersionSpecificMethods();
  }

  #getNodeVersion(): NodeJsVersion {
    const [major, minor, patch] = process.versions.node.split(".").map(Number);
    return { major, minor, patch };
  }

  // Get Node.js version-specific methods.
  #getVersionSpecificMethods(): NodeJsVersionSpecificMethods {
    const { major } = this.#nodeVersion;

    if (major <= 11) {
      return {
        recoverMantissa: (n: number): bigint => {
          const buffer = Buffer.alloc(8);
          buffer.writeDoubleLE(n + 1, 0);
          return buffer.readBigUInt64LE(0) & this.#IEEE754_MANTISSA_BITS_MASK;
        },
        toDouble: (concreteState: Pair<bigint>): number => {
          const n = concreteState[0] + concreteState[1];
          const buffer = Buffer.alloc(8);
          buffer.writeBigUInt64LE((n & this.#IEEE754_MANTISSA_BITS_MASK) | this.#IEEE754_EXPONENT_BITS_MASK, 0);
          return buffer.readDoubleLE(0) - 1;
        },
        constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
          const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(this.#IEEE754_MANTISSA_BITS_MASK, 64));
          solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
        },
      };
    }

    if (major <= 23) {
      return {
        recoverMantissa: (n: number): bigint => {
          const buffer = Buffer.alloc(8);
          buffer.writeDoubleLE(n + 1, 0);
          return buffer.readBigUInt64LE(0) & this.#IEEE754_MANTISSA_BITS_MASK;
        },
        toDouble: (concreteState: Pair<bigint>): number => {
          const buffer = Buffer.alloc(8);
          buffer.writeBigUInt64LE((concreteState[0] >> 12n) | this.#IEEE754_EXPONENT_BITS_MASK, 0);
          return buffer.readDoubleLE(0) - 1;
        },
        constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
          solver.add(symbolicState[0].lshr(12).eq(context.BitVec.val(mantissa, 64)));
        },
      };
    }

    // Latest Node version (major version >= 24)
    return {
      recoverMantissa: (n: number): bigint => {
        const mantissa = Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT);
        return BigInt(mantissa);
      },
      toDouble: (concreteState: Pair<bigint>): number => {
        return Number(concreteState[0] >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
      },
      constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
        solver.add(symbolicState[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
      },
    };
  }

  // Solves symbolic state so we can move forward using concrete state, which
  // is much faster than having to compute symbolic state for every prediction.
  async #solveSymbolicState(): Promise<boolean> {
    try {
      const { Context } = await z3.init();
      const context = Context("main");
      const solver = new context.Solver();
      const symbolicState0 = context.BitVec.const("ss0", 64);
      const symbolicState1 = context.BitVec.const("ss1", 64);
      // We do not directly initialize symbolic states inside of our symbolic state Pair because
      // we need references to the original state/BitVecs in order to be able to pull them out of our model.
      const symbolicStatePair: Pair<z3.BitVec> = [symbolicState0, symbolicState1];
      // V8’s Math.random() returns a number derived from the state *after* advancing the PRNG.
      // To reconstruct the original hidden state for the solver, we must process the observed
      // sequence in reverse order: last observed number first, first observed number last.
      const sequence = [...this.sequence].reverse();

      for (const n of sequence) {
        this.#xorShift.symbolic(symbolicStatePair); // Modifies symbolic state
        const mantissa = this.#versionSpecificMethods.recoverMantissa(n);
        this.#versionSpecificMethods.constrainMantissa(mantissa, symbolicStatePair, solver, context);
      }

      if ((await solver.check()) !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = solver.model();
      this.#concreteState = [
        // Order matters here!
        (model.get(symbolicState0) as z3.BitVecNum).value(),
        (model.get(symbolicState1) as z3.BitVecNum).value(),
      ];
      this.#isSymbolicStateSolved = true;
      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
