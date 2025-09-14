import * as z3 from "z3-solver";
import { UnsatError } from "../errors.js";
import { Pair } from "../types.js";

export default class ChromeRandomnessPredictor {
  public sequence: number[];

  // 64 bit mask to wrap a BigInt as an unsigned 64 bit integer (uint64)
  #UINT64_MASK = 0xffffffffffffffffn;
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
    this.#xorShift128PlusConcrete(this.#concreteState);
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
      // Each Math.random() output comes from the PRNG state *after* it advances. To reconstruct the original
      // hidden state, we must walk the PRNG backwards, which means processing the observed sequence in reverse order.
      const sequence = [...this.sequence].reverse();

      for (const n of sequence) {
        this.#xorShift128PlusSymbolic(symbolicStatePair); // Modifies symbolic state pair.
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

  // Simulates C/C++ uint64_t overflow (wrapping).
  #uint64_t(n: bigint): bigint {
    return n & this.#UINT64_MASK;
  }

  // Modifies symbolic state.
  #xorShift128PlusSymbolic(symbolicState: Pair<z3.BitVec>): void {
    const state1 = symbolicState[0];
    const state0 = symbolicState[1];
    let nextState1 = state1.xor(state1.shl(23));
    nextState1 = nextState1.xor(nextState1.lshr(17));
    nextState1 = nextState1.xor(state0);
    nextState1 = nextState1.xor(state0.lshr(26));
    symbolicState[0] = state0;
    symbolicState[1] = nextState1;
  }

  // Modifies concrete state. Performs XORShift128+ backwards on concrete state, due to how V8 provides random numbers.
  #xorShift128PlusConcrete(concreteState: Pair<bigint>): void {
    const state1 = concreteState[0];
    let state0 = concreteState[1] ^ (state1 >> 26n);
    state0 ^= state1;
    state0 = this.#uint64_t(state0 ^ (state0 >> 17n) ^ (state0 >> 34n) ^ (state0 >> 51n));
    state0 = this.#uint64_t(state0 ^ (state0 << 23n) ^ (state0 << 46n));
    concreteState[0] = state0;
    concreteState[1] = state1;
  }

  #recoverMantissa(n: number): bigint {
    return BigInt(Math.floor(n * Number(1n << 53n)));
  }

  #toDouble(n: bigint): number {
    return Number(n >> 11n) / Math.pow(2, 53);
  }
}
