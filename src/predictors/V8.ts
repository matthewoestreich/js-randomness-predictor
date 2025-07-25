import * as z3 from "z3-solver";
import { NodeJsVersion } from "../types.js";
import { UnsatError } from "../errors.js";

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

export default class V8RandomnessPredictor {
  // See here for why MAX_SEQUENCE_LENGTH is needed: https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#random-number-pool-exhaustion
  #MAX_SEQUENCE_LENGTH = 64;
  #DEFAULT_SEQUENCE_LENGTH = 4;
  #nodeVersion: NodeJsVersion = this.#getNodeVersion();
  #isInitialized = false;
  #concreteState0 = 0n;
  #concreteState1 = 0n;
  #mask = 0xffffffffffffffffn;
  #internalSequence: number[] = [];
  #seState0: z3.BitVec | undefined;
  #seState1: z3.BitVec | undefined;
  #s0Ref: z3.BitVec | undefined;
  #s1Ref: z3.BitVec | undefined;
  #solver: z3.Solver | undefined;
  #context: z3.Context | undefined;

  public sequence: number[];

  constructor(sequence?: number[]) {
    if (sequence && sequence.length >= this.#MAX_SEQUENCE_LENGTH) {
      throw new Error(`sequence.length must be less than '${this.#MAX_SEQUENCE_LENGTH}', got '${sequence.length}'`);
    }
    if (!sequence) {
      sequence = Array.from({ length: this.#DEFAULT_SEQUENCE_LENGTH }, Math.random);
    }
    this.sequence = sequence;
    this.#internalSequence = [...sequence.reverse()];
  }

  async predictNext(): Promise<number> {
    await this.#initialize();
    return this.#toDouble(this.#xorShift128PlusConcrete());
  }

  // For testing - DO NOT USE IF YOU DON'T WANT TO BREAK THINGS.
  setNodeVersion(version: NodeJsVersion): void {
    this.#nodeVersion = version;
  }

  #getNodeVersion(): NodeJsVersion {
    const [major, minor, patch] = process.versions.node.split(".").map(Number);
    return { major, minor, patch };
  }

  // `#initialize()` essentially solves symbolic state so we can move forward using
  // concrete state (which is way faster than having to recompute symbolic state
  // for every prediction).
  async #initialize(): Promise<boolean> {
    if (this.#isInitialized) {
      return true;
    }
    try {
      const { Context } = await z3.init();
      this.#context = Context("main");
      this.#solver = new this.#context.Solver();
      this.#seState0 = this.#context.BitVec.const("se_state0", 64);
      this.#seState1 = this.#context.BitVec.const("se_state1", 64);
      this.#s0Ref = this.#seState0;
      this.#s1Ref = this.#seState1;

      for (let i = 0; i < this.#internalSequence.length; i++) {
        this.#xorShift128PlusSymbolic();
        this.#recoverMantissaAndAddToSolver(this.#internalSequence[i]);
      }

      const check = await this.#solver.check();
      if (check !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = this.#solver.model();
      this.#concreteState0 = (model.get(this.#s0Ref!) as z3.BitVecNum).value();
      this.#concreteState1 = (model.get(this.#s1Ref!) as z3.BitVecNum).value();
      this.#isInitialized = true;
      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Performs XORShift128+ on symbolic state (z3).
  #xorShift128PlusSymbolic(): void {
    if (!this.#seState0 || !this.#seState1) {
      throw new Error(`[V8][xorShift128PlusSymbolic] Either seState0 or seState1 is undefined!`);
    }
    let s1 = this.#seState0;
    let s0 = this.#seState1;
    this.#seState0 = s0;
    s1 = s1.xor(s1.shl(23));
    s1 = s1.xor(s1.lshr(17));
    s1 = s1.xor(s0);
    s1 = s1.xor(s0.lshr(26));
    this.#seState1 = s1;
  }

  // Performs XORShift128+ backwards on concrete state, due to how V8 provides random numbers.
  #xorShift128PlusConcrete(): bigint {
    const ogConcreteState0 = this.#concreteState0;
    const ogConcreteState1 = this.#concreteState1;

    let ps1 = this.#concreteState0!;
    let ps0 = this.#concreteState1! ^ (ps1 >> 26n);
    ps0 ^= ps1;
    ps0 = (ps0 ^ (ps0 >> 17n) ^ (ps0 >> 34n) ^ (ps0 >> 51n)) & this.#mask;
    ps0 = (ps0 ^ (ps0 << 23n) ^ (ps0 << 46n)) & this.#mask;
    this.#concreteState0 = ps0;
    this.#concreteState1 = ps1;

    // Very old logic that goes back to at least v10
    if (this.#nodeVersion.major <= 11) {
      return ogConcreteState0 + ogConcreteState1;
    }
    // Newer logic
    return ogConcreteState0;
  }

  #recoverMantissaAndAddToSolver(n: number): void {
    const majorVersion = this.#nodeVersion.major;

    // Very old logic that goes back to at least v10
    if (majorVersion <= 11) {
      const buffer = Buffer.alloc(8);
      buffer.writeDoubleLE(n + 1, 0);
      const rawBits = (BigInt(buffer.readUInt32LE(4)) << 32n) | BigInt(buffer.readUInt32LE(0));
      const mantissaMask = 0x000fffffffffffffn;
      const mantissa = rawBits & mantissaMask;

      const sum = this.#seState0!.add(this.#seState1!).and(this.#context!.BitVec.val(mantissaMask, 64));
      this.#solver!.add(sum.eq(this.#context!.BitVec.val(mantissa, 64)));
      return;
    }

    // Old-ish `ToDouble` logic (in use from ~2022 - Feb 2025)
    if (majorVersion <= 23) {
      const buffer = Buffer.alloc(8);
      buffer.writeDoubleLE(n + 1, 0);
      const uint64 = (BigInt(buffer.readUInt32LE(4)) << 32n) | BigInt(buffer.readUInt32LE(0));
      const mantissa = uint64 & ((1n << 52n) - 1n);
      this.#solver!.add(this.#seState0!.lshr(12).eq(this.#context!.BitVec.val(mantissa, 64)));
      return;
    }

    // New `ToDouble` logic (Feb 2025) introduced to V8.
    const mantissa = Math.floor(n * Math.pow(2, 53));
    this.#solver!.add(this.#seState0!.lshr(11).eq(this.#context!.BitVec.val(BigInt(mantissa), 64)));
  }

  #toDouble(n: bigint): number {
    const majorVersion = this.#nodeVersion.major;

    // Very old logic that goes back to at least v10
    if (majorVersion <= 11) {
      const kExponentBits = 0x3ff0000000000000n;
      const kMantissaMask = 0x000fffffffffffffn;
      const random = (n & kMantissaMask) | kExponentBits;
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(random, 0);
      return buffer.readDoubleLE(0) - 1;
    }

    /* Old-ish logic (pre-Feb 2025) */
    if (majorVersion <= 23) {
      const buffer = Buffer.allocUnsafe(8);
      buffer.writeBigUInt64LE((n >> 12n) | 0x3ff0000000000000n, 0);
      return buffer.readDoubleLE(0) - 1;
    }

    /* New ToDouble logic (Feb 2025+) */
    return Number(n >> 11n) / Math.pow(2, 53);
  }
}
