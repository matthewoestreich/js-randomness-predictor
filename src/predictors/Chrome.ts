import * as z3 from "z3-solver-jsrp";
import { UnsatError } from "../errors.js";
import { Pair, StateConversionMap } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import uint64 from "../uint64.js";

/**
 * ========================================================================================
 * ~ Documenting changes to the Chrome Math.random algorithm ~
 * ========================================================================================
 *
 * JANUARY 2026 UPDATE (comment written on Feb 1, 2026)
 *    - See this issue : https://github.com/matthewoestreich/js-randomness-predictor/issues/25
 *    - V8 updated their Math.random implementation in the following commit:
 *        - https://source.chromium.org/chromium/_/chromium/v8/v8/+/0596ead5b04f5988d7742c2a4559637a4f81b849
 *    - AT THE TIME OF WRITING THIS COMMENT, we now first try to old algo - if we get UNSAT, we
 *      try again with the updated algo. If the updated algo produces an error, we return it.
 */

export default class ChromeRandomnessPredictor {
  public sequence: number[];

  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #concreteState: Pair<bigint> = [0n, 0n];
  #rotateVersionSpecificMethods = this.#createVersionSpecificMethodsFactory();
  #versionSpecificMethods = this.#rotateVersionSpecificMethods();

  constructor(sequence: number[]) {
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#withRetry(
        () => this.#solveSymbolicState(),
        () => {
          // Retry with updated version specific methods.
          this.#versionSpecificMethods = this.#rotateVersionSpecificMethods();
          return this.#solveSymbolicState();
        },
      );
    }
    return this.#versionSpecificMethods.toDouble(this.#concreteState);
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
      // V8’s Math.random() returns a number derived from the state *after* advancing the PRNG.
      // To reconstruct the original hidden state for the solver, we must process the observed
      // sequence in reverse order: last observed number first, first observed number last.
      const sequence = [...this.sequence].reverse();

      for (const n of sequence) {
        XorShift128Plus.symbolic(symbolicStatePair); // Modifies symbolic state pair.
        const mantissa = this.#versionSpecificMethods.recoverMantissa(n);
        this.#versionSpecificMethods.constrainMantissa(mantissa, symbolicStatePair, solver, context);
      }

      if ((await solver.check()) !== "sat") {
        throw new UnsatError();
      }

      const model = solver.model();
      this.#concreteState = [
        // Order matters here!
        (model.get(symbolicState0) as z3.BitVecNum).value(),
        (model.get(symbolicState1) as z3.BitVecNum).value(),
      ];
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async #withRetry<BT, RT>(baseFn: () => Promise<BT>, retryFn: () => Promise<RT>): Promise<BT | RT> {
    try {
      return await baseFn();
    } catch (_e: unknown) {
      return await retryFn();
    }
  }

  #createVersionSpecificMethodsFactory(): () => StateConversionMap {
    // If calls is an odd number, we return logic prior to the January 2026 update.
    // If calls is an even number, we return logic after the January 2026 update.
    let calls = 0;

    return (): StateConversionMap => {
      calls += 1;

      if (calls % 2 > 0) {
        // See comment at top of file.
        // This object of functions contains logic prior to the January 2026 update.
        return {
          recoverMantissa: (n: number): bigint => {
            const mantissa = Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT);
            return BigInt(mantissa);
          },
          toDouble: (concreteState: Pair<bigint>): number => {
            // Calculate next prediction, using first item in concrete state, before modifying concrete state.
            const next = Number(concreteState[0] >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
            // Modify concrete state.
            XorShift128Plus.concreteBackwards(concreteState);
            return next;
          },
          constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
            solver.add(symbolicState[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
          },
        };
      }

      // See comment at top of file.
      // This object of functions contains logic for the Math.random impl AFTER the January 2026 update.
      return {
        recoverMantissa: (n: number): bigint => {
          const mantissa = Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT);
          return BigInt(mantissa);
        },
        toDouble: (concreteState: Pair<bigint>): number => {
          const random = uint64(concreteState[0] + concreteState[1]);
          // Calculate next prediction, using first item in concrete state, before modifying concrete state.
          const next = Number(random >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
          // Modify concrete state.
          XorShift128Plus.concreteBackwards(concreteState);
          return next;
        },
        constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
          const sum = symbolicState[0].add(symbolicState[1]);
          solver.add(sum.lshr(11).eq(context.BitVec.val(mantissa, 64)));
        },
      };
    };
  }
}
