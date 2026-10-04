import * as z3 from "z3-solver-jsrp";
import { SolvingStrategy, Pair } from "../../types.js";
import { UnsatError } from "../../errors.js";

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
