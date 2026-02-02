import * as z3 from "z3-solver-jsrp";
import { UnexpectedRuntimeError, UnsatError } from "../errors.js";
import { Pair, SolvingStrategy } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import ExecutionRuntime from "../ExecutionRuntime.js";
import uint64 from "../uint64.js";

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

export default class DenoRandomnessPredictor {
  public sequence: number[];

  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #concreteState: Pair<bigint> = [0n, 0n];
  #strategy: SolvingStrategy;

  #solvingStrategies: SolvingStrategy[] = [
    // Pre Jan 2026 changes
    {
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
    },
    // Post Jan 2026 changes
    {
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
    },
  ];

  constructor(sequence?: number[]) {
    if (!sequence) {
      if (!ExecutionRuntime.isDeno()) {
        throw new UnexpectedRuntimeError("Expected Deno runtime! Unable to auto-generate sequence, please provide one.");
      }
      sequence = Array.from({ length: 4 }, Math.random);
    }
    this.sequence = sequence;
    this.#strategy = this.#solvingStrategies[0];
  }

  public async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#solveWithStrategies();
    }
    return this.#strategy.toDouble(this.#concreteState);
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
        const mantissa = this.#strategy.recoverMantissa(n);
        this.#strategy.constrainMantissa(mantissa, symbolicStatePair, solver, context);
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

  async #solveWithStrategies(): Promise<void> {
    let lastUnsatError: undefined | UnsatError;

    for (const strategy of this.#solvingStrategies) {
      try {
        this.#strategy = strategy;
        return await this.#solveSymbolicState();
      } catch (err) {
        // Got a diff error unrelated to solving symbolic state,
        // so we need to respect it and throw it.
        if (!(err instanceof UnsatError)) {
          throw err;
        }
        lastUnsatError = err;
      }
    }

    throw lastUnsatError ?? new Error("No strategies attempted");
  }
}
