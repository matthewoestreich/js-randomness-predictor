import * as z3 from "z3-solver";
import { UnsatError } from "../errors.js";
import { Pair } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";

export default class ChromeRandomnessPredictor {
  public sequence: number[];

  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #xorShift = new XorShift128Plus();
  #isSymbolicStateSolved = false;
  #concreteState: Pair<bigint> = [0n, 0n];

  constructor(sequence: number[]) {
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (!this.#isSymbolicStateSolved) {
      await this.#solveSymbolicState();
    }
    // Calculate next prediction, using first item in concrete state, before modifying concrete state.
    const next = this.#toDouble(this.#concreteState[0]);
    // Modify concrete state.
    this.#xorShift.concreteBackwards(this.#concreteState);
    return next;
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
        this.#xorShift.symbolic(symbolicStatePair); // Modifies symbolic state pair.
        const mantissa = this.#recoverMantissa(n);
        solver.add(symbolicStatePair[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
      }

      if ((await solver.check()) !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = solver.model();
      // Use original, unmodified references to symbolic state(s) to pull values from model.
      const concreteState0 = (model.get(symbolicState0) as z3.BitVecNum).value();
      const concreteState1 = (model.get(symbolicState1) as z3.BitVecNum).value();
      this.#concreteState = [concreteState0, concreteState1];
      this.#isSymbolicStateSolved = true;
      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  #recoverMantissa(n: number): bigint {
    const mantissa = Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT);
    return BigInt(mantissa);
  }

  #toDouble(n: bigint): number {
    return Number(n >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
