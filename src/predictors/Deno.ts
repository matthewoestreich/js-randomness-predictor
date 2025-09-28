import * as z3 from "z3-solver-jsrp";
import { UnexpectedRuntimeError, UnsatError } from "../errors.js";
import { Pair } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import ExecutionRuntime from "../ExecutionRuntime.js";

export default class DenoRandomnessPredictor {
  public sequence: number[];

  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #concreteState: Pair<bigint> = [0n, 0n];

  constructor(sequence?: number[]) {
    if (!sequence) {
      if (!ExecutionRuntime.isDeno()) {
        throw new UnexpectedRuntimeError("Expected Deno runtime! Unable to auto-generate sequence, please provide one.");
      }
      sequence = Array.from({ length: 4 }, Math.random);
    }
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#solveSymbolicState();
    }
    // Calculate next random number before we modify concrete state.
    const next = this.#toDouble(this.#concreteState[0]);
    // Modify concrete state.
    XorShift128Plus.concreteBackwards(this.#concreteState);
    return next;
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
        XorShift128Plus.symbolic(symbolicStatePair); // Modifies symbolc state pair.
        const mantissa = this.#recoverMantissa(n);
        solver.add(symbolicStatePair[0].lshr(11).eq(context.BitVec.val(mantissa, 64)));
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

  #recoverMantissa(double: number): bigint {
    const mantissa = Math.floor(double * this.#SCALING_FACTOR_53_BIT_INT);
    return BigInt(mantissa);
  }

  #toDouble(n: bigint): number {
    return Number(n >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
