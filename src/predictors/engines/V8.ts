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
    const next = this.#strategy.toDouble(this.#concreteState);
    // In V8, we advance concrete state AFTER producing next random number.
    this.#strategy.concreteXorShift(this.#concreteState);
    return next;
  }

  protected setSolvingStrategies(strategies: SolvingStrategy[]): void {
    this.#solvingStrategies = strategies;
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
        this.#strategy.symbolicXorShift(symbolicStatePair); // Modifies symbolic state
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
