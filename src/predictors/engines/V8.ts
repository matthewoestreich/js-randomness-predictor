import * as z3 from "z3-solver-jsrp";
import { SolvingStrategy, Pair } from "../../types.js";
import { UnsatError } from "../../errors.js";

/**
 *  BEFORE FEBRUARY 2025
 *    - In Node versions <= 11 the ToDouble method was different : https://github.com/nodejs/node/blob/v10.0.0/deps/v8/src/base/utils/random-number-generator.h#L114-L120
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
 *  FEBRUARY 2025 UPDATE
 *    - V8 updated their impl of the `ToDouble` method. The old method was in use since 2022.
 *    - Old Impl: https://github.com/v8/v8/blob/e99218a1cca470ddec1931547b36a256f3450078/src/base/utils/random-number-generator.h#L111
 *      ```
 *      // Static and exposed for external use.
 *      static inline double ToDouble(uint64_t state0) {
 *        // Exponent for double values for [1.0 .. 2.0)
 *        static const uint64_t kExponentBits = uint64_t{0x3FF0000000000000};
 *        uint64_t random = (state0 >> 12) | kExponentBits;
 *        return base::bit_cast<double>(random) - 1;
 *      }
 *      ```
 *    - New Impl: https://github.com/v8/v8/blob/1c3a9c08e932e87b04c7bf9ecc648e1f50d418fd/src/base/utils/random-number-generator.h#L111
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
 * JANUARY 2026 UPDATE
 *    - See this issue : https://github.com/matthewoestreich/js-randomness-predictor/issues/25
 *    - V8 updated their Math.random implementation in the following commit:
 *        - https://source.chromium.org/chromium/_/chromium/v8/v8/+/0596ead5b04f5988d7742c2a4559637a4f81b849
 *
 * MAY 2026 UPDATE (Deno v2.9.7ish)
 *    - Commit: https://source.chromium.org/chromium/_/chromium/v8/v8/+/99f606174481f6e2f4809c4262122a30a25583af
 *    - V8 changed Math.random cache population order, meaning we do not need to reverse the sequence!
 *    ```
 *    // OLD:
 *    // Create random numbers.
 *    for (int i = 0; i < kCacheSize; i++) { ... }
 *
 *    // NEW:
 *    // Create random numbers.
 *    for (int i = kCacheSize - 1; i >= 0; i--) { ... }
 *    ```
 *    - The PRNG algorithm/output transformation remains the same, but observed values now correspond to forward state progression.
 */

export default class V8Predictor {
  public sequence: number[];
  #concreteState: Pair<bigint> = [0n, 0n];
  #solvingStrategies: SolvingStrategy[];
  #strategy: SolvingStrategy;

  constructor(sequence: number[], solvingStrategies: SolvingStrategy[]) {
    if (solvingStrategies.length <= 0) {
      throw new Error("V8EnginePredictor requires at least one solvingStrategy in solvingStrategies");
    }
    this.sequence = sequence;
    this.#solvingStrategies = solvingStrategies;
    this.#strategy = this.#solvingStrategies[0];
  }

  async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#solveWithStrategies();
    }

    /* In newer V8 (post May 2026 changes), we advance concrete state BEFORE producing next random number. */
    if (this.#strategy.advanceConcreteStateBeforeProducingNextRandom === true) {
      // Advance concrete state.
      this.#strategy.concreteXorShift(this.#concreteState);
      // Produce next random number.
      return this.#strategy.toDouble(this.#concreteState);
    }

    /* In older V8 (prior to May 2026 changes), we advance concrete state AFTER producing next random number. */
    if (this.#strategy.advanceConcreteStateBeforeProducingNextRandom === false) {
      // Produce next random number.
      const next = this.#strategy.toDouble(this.#concreteState);
      // Advance concrete state (this is done AFTER producing next random number).
      this.#strategy.concreteXorShift(this.#concreteState);
      return next;
    }

    throw new Error("V8EnginePredictor : strategy is missing concrete state advancement option");
  }

  // Solves symbolic state so we can move forward using concrete state, which
  // is much faster than having to compute symbolic state for every prediction.
  async #solveSymbolicState(): Promise<void> {
    try {
      const { Context } = await z3.init();
      const context = Context("main");
      const solver = new context.Solver();
      const symbolicState0 = context.BitVec.const("ss0", 64);
      const symbolicState1 = context.BitVec.const("ss1", 64);
      // We do not directly initialize symbolic states inside of our symbolic state Pair because
      // we need references to the original state/BitVecs in order to be able to pull them out of our model.
      const symbolicStatePair: Pair<z3.BitVec> = [symbolicState0, symbolicState1];
      const sequence = [...this.sequence];

      // In older V8’s (prior to May 2026 commit) Math.random() returns a number derived from
      // the state *after* advancing the PRNG.
      // To reconstruct the original hidden state for the solver, we must process the observed
      // sequence in reverse order: last observed number first, first observed number last.
      if (this.#strategy.advanceConcreteStateBeforeProducingNextRandom === false) {
        sequence.reverse();
      }

      for (const n of sequence) {
        this.#strategy.symbolicXorShift(symbolicStatePair); // Modifies symbolic state
        const mantissa = this.#strategy.recoverMantissa(n);
        this.#strategy.constrainMantissa(mantissa, symbolicStatePair, solver, context);
      }

      if ((await solver.check()) !== "sat") {
        throw new UnsatError();
      }

      const model = solver.model();
      const concreteStatePair: Pair<bigint> = [
        // Order matters here!
        (model.get(symbolicState0) as z3.BitVecNum).value(),
        (model.get(symbolicState1) as z3.BitVecNum).value(),
      ];

      if (this.#strategy.advanceConcreteStateBeforeProducingNextRandom === true) {
        // In newer V8 (post May 2026 changes) we need to advance concrete state to the next unseen number.
        // Z3 returns state at sequence start, so we have to advance concrete state up to the same point
        // as our initial sequence length.
        for (const _ of this.sequence) {
          this.#strategy.concreteXorShift(concreteStatePair);
        }
      }

      this.#concreteState = concreteStatePair;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async #solveWithStrategies(): Promise<void> {
    let lastUnsatError: undefined | UnsatError;

    for (const strategy of this.#solvingStrategies) {
      try {
        this.#strategy = strategy;
        return await this.#solveSymbolicState();
      } catch (e) {
        // We only want to try the next strategy if the current
        // strategy produces an Unsat error. Otherwise, we shoould
        // respect the error and throw it.
        if (!(e instanceof UnsatError)) {
          throw e;
        }
        lastUnsatError = e;
      }
    }

    throw lastUnsatError ?? new Error("V8EnginePredictor : no strategies attempted");
  }
}
