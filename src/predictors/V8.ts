import * as z3 from "z3-solver";
import { NodeJSVersion } from "../types.js";

/**
 *
 * 1. In Node v24.x.x (commit was in Feb2025), V8 updated their impl of the `ToDouble` method. The old method was in use since 2022.
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
  #nodeVersion: NodeJSVersion = this.#getNodeVersion();
  #isInitialized = false;
  #seState0: z3.BitVec | undefined;
  #seState1: z3.BitVec | undefined;
  #s0Ref: z3.BitVec | undefined;
  #solver: z3.Solver | undefined;
  #context: z3.Context | undefined;
  #internalSequence: number[] = [];

  public sequence: number[] = [];

  // For testing - DO NOT USE IF YOU DON'T WANT TO BREAK THINGS.
  setNodeVersion(version: NodeJSVersion): void {
    this.#nodeVersion = version;
  }

  constructor(sequence?: number[]) {
    if (sequence === undefined) {
      // Generate sequence ourselves
      sequence = Array.from({ length: 4 }, Math.random);
    }
    this.#internalSequence = [...sequence];
    this.sequence = [...this.#internalSequence];
    this.#internalSequence.reverse();
  }

  public async predictNext(): Promise<number> {
    const next = await this.#predict();
    this.#internalSequence.unshift(next);
    // Only keep 4 numbers since that seems to be what we need to successfully predict.
    if (this.#internalSequence.length > 4) {
      this.#internalSequence.splice(4);
    }
    return next;
  }

  #getNodeVersion(): NodeJSVersion {
    const [major, minor, patch] = process.versions.node.split(".").map(Number);
    return { major, minor, patch };
  }

  async #initialize() {
    if (this.#isInitialized) {
      return true;
    }
    try {
      const { Context } = await z3.init();
      this.#context = Context("main");
      this.#isInitialized = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  async #predict(): Promise<number> {
    if (!this.#isInitialized) {
      if (!(await this.#initialize())) {
        return Promise.reject("[V8 Predictor] Initialization failed!");
      }
    }
    if (this.#context === undefined) {
      return Promise.reject("[V8 Predictor] Context not initialized!");
    }

    this.#solver = new this.#context.Solver();
    this.#seState0 = this.#context.BitVec.const("se_state0", 64);
    this.#seState1 = this.#context.BitVec.const("se_state1", 64);
    this.#s0Ref = this.#seState0;

    for (let i = 0; i < this.#internalSequence.length; i++) {
      this.#xorShift128Plus(this.#seState0, this.#seState1);
      this.#recoverMantissaAndAddToSolver(this.#internalSequence[i]);
    }

    const check = await this.#solver.check();
    if (check !== "sat") {
      throw new Error(`Unsatisfiable: unable to reconstruct internal state. ${check}`);
    }

    const model = this.#solver.model();
    const state0 = (model.get(this.#s0Ref) as z3.BitVecNum).value();
    return this.#toDouble(state0);
  }

  #recoverMantissaAndAddToSolver(n: number): void {
    const majorVersion = this.#nodeVersion.major;

    if (majorVersion >= 24) {
      // New `ToDouble` logic (Feb 2025) introduced to V8.
      const mantissa = Math.floor(n * Math.pow(2, 53));
      this.#solver!.add(this.#seState0!.lshr(11).eq(this.#context!.BitVec.val(BigInt(mantissa), 64)));
      return;
    }

    // Old `ToDouble` logic (in use from ~2022 - Feb 2025)
    const uint64 = this.#doubleToUInt64(n + 1);
    const mantissa = uint64 & ((BigInt(1) << BigInt(52)) - BigInt(1));
    this.#solver!.add(this.#seState0!.lshr(12).eq(this.#context!.BitVec.val(mantissa, 64)));
  }

  #xorShift128Plus(state0: z3.BitVec, state1: z3.BitVec) {
    let s1 = state0;
    let s0 = state1;
    this.#seState0 = s0;
    s1 = s1.xor(s1.shl(23));
    s1 = s1.xor(s1.lshr(17));
    s1 = s1.xor(s0);
    s1 = s1.xor(s0.lshr(26));
    this.#seState1 = s1;
  }

  #doubleToUInt64(value: number): bigint {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleLE(value, 0);
    return (BigInt(buffer.readUInt32LE(4)) << BigInt(32)) | BigInt(buffer.readUInt32LE(0));
  }

  #toDouble(n: bigint): number {
    const majorVersion = this.#nodeVersion.major;

    if (majorVersion >= 24) {
      // New ToDouble logic (Feb 2025+)
      const value = n >> 11n; // drop 11 bits
      const result = Number(value) / Math.pow(2, 53);
      return result;
    }

    // Old logic (pre-Feb 2025)
    const random = (n >> 12n) | 0x3ff0000000000000n;
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64LE(random, 0);
    return buffer.readDoubleLE(0) - 1;
  }
}
