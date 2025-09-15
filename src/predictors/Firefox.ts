import * as z3 from "z3-solver";
import { UnsatError } from "../errors.js";
import { Pair } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";

export default class FirefoxRandomnessPredictor extends XorShift128Plus {
  public sequence: number[];

  // 64 bit mask to wrap a BigInt as an unsigned 64 bit integer (uint64)
  #UINT64_MASK = 0xffffffffffffffffn;
  // The mantissa bits (53 effective bits = 52 stored + 1 implicit) for doubles as defined in IEEE-754
  #IEEE754_MANTISSA_BITS_MASK = 0x1fffffffffffffn;
  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #isSymbolicStateSolved = false;
  #concreteState: Pair<bigint> = [0n, 0n];

  constructor(sequence: number[]) {
    super();
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (!this.#isSymbolicStateSolved) {
      await this.#solveSymbolicState();
    }
    // Modify concrete state before calculating our next prediction.
    this.xorShift128PlusConcrete(this.#concreteState);
    const uint64 = this.#uint64_t(this.#concreteState[0] + this.#concreteState[1]);
    return this.#toDouble(uint64);
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

      for (const n of this.sequence) {
        this.xorShift128PlusSymbolic(symbolicStatePair); // Modifies symbolc state pair.
        const mantissa = this.#recoverMantissa(n);
        const sum = symbolicStatePair[0].add(symbolicStatePair[1]).and(context!.BitVec.val(this.#IEEE754_MANTISSA_BITS_MASK, 64));
        solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
      }

      if ((await solver.check()) !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = solver.model();
      const concreteStatePair: Pair<bigint> = [
        (model.get(symbolicState0) as z3.BitVecNum).value(),
        (model.get(symbolicState1) as z3.BitVecNum).value(),
      ];

      // Advance concrete state to the next unseen number. Z3 returns state at sequence start,
      // so we have to advance concrete state up to the same point as our initial sequence length.
      for (const _ of this.sequence) {
        this.xorShift128PlusConcrete(concreteStatePair);
      }

      this.#concreteState = concreteStatePair;
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

  #recoverMantissa(double: number): bigint {
    return BigInt(Math.floor(double * this.#SCALING_FACTOR_53_BIT_INT));
  }

  #toDouble(n: bigint): number {
    return Number(n & this.#IEEE754_MANTISSA_BITS_MASK) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
