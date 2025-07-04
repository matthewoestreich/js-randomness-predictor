import * as z3 from "z3-solver";
import { UnsatError } from "../errors.js";

export default class FirefoxRandomnessPredictor {
  #isInitialized = false;
  #mask = 0xffffffffffffffffn;
  #seState0: z3.BitVec | undefined;
  #seState1: z3.BitVec | undefined;
  #s0Ref: z3.BitVec | undefined;
  #s1Ref: z3.BitVec | undefined;
  #solver: z3.Solver | undefined;
  #context: z3.Context | undefined;
  #concreteState0 = 0n;
  #concreteState1 = 0n;

  public sequence: number[] = [];

  constructor(sequence: number[]) {
    this.sequence = sequence;
  }

  async #initialize(): Promise<boolean> {
    if (this.#isInitialized) {
      return true;
    }
    try {
      const { Context } = await z3.init();
      this.#context = Context("main");
      this.#solver = new this.#context.Solver();
      this.#seState0 = this.#context.BitVec.const("se_state0", 64);
      this.#seState1 = this.#context.BitVec.const("se_state1", 64);
      this.#s0Ref = this.#seState0;
      this.#s1Ref = this.#seState1;

      for (let i = 0; i < this.sequence.length; i++) {
        this.#xorShift128PlusSymbolic();
        const mantissa = this.#recoverMantissa(this.sequence[i]);
        const state = this.#seState0.add(this.#seState1).and(this.#context!.BitVec.val(0x1fffffffffffff, 64));
        this.#solver.add(state.eq(this.#context.BitVec.val(mantissa, 64)));
      }

      const check = await this.#solver.check();
      if (check !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = this.#solver.model();
      this.#concreteState0 = (model.get(this.#s0Ref) as z3.BitVecNum).value();
      this.#concreteState1 = (model.get(this.#s1Ref) as z3.BitVecNum).value();

      // We have to get our concrete state up to the same point as our symbolic state,
      // therefore, we discard as many concrete XOR shift calls as we have `this.sequence.length`
      // Otherwise, we would return random numbers to the caller that they already have.
      // Now, when we return from predictNext() we get the actual next.
      for (let i = 0; i < this.sequence.length; i++) {
        this.#xorShift128PlusConcrete();
      }

      this.#isInitialized = true;
      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Predict next random number.
   * @returns {Promise<number>}
   */
  public async predictNext(): Promise<number> {
    await this.#initialize();
    return this.#toDouble(this.#xorShift128PlusConcrete());
  }

  #xorShift128PlusSymbolic() {
    if (this.#seState0 === undefined || this.#seState1 === undefined) {
      throw new Error("States are not defined!");
    }
    let s1 = this.#seState0;
    let s0 = this.#seState1;
    s1 = s1.xor(s1.shl(23));
    s1 = s1.xor(s1.lshr(17));
    s1 = s1.xor(s0);
    s1 = s1.xor(s0.lshr(26));
    this.#seState0 = this.#seState1;
    this.#seState1 = s1;
  }

  #xorShift128PlusConcrete(): bigint {
    let s1 = this.#concreteState0 & this.#mask;
    let s0 = this.#concreteState1 & this.#mask;
    s1 ^= (s1 << 23n) & this.#mask;
    s1 ^= (s1 >> 17n) & this.#mask;
    s1 ^= s0 & this.#mask;
    s1 ^= (s0 >> 26n) & this.#mask;
    this.#concreteState0 = s0 & this.#mask;
    this.#concreteState1 = s1 & this.#mask;
    return (this.#concreteState0 + this.#concreteState1) & this.#mask;
  }

  #recoverMantissa(double: number): bigint {
    return BigInt(Math.floor(double * Math.pow(2, 53)));
  }

  #toDouble(n: bigint): number {
    return Number(n & 0x1fffffffffffffn) / Number(1n << 53n);
  }
}
