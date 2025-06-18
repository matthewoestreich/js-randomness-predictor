import * as z3 from "z3-solver";

export default class FirefoxRandomnessPredictor_New {
  #isInitialized = false;
  #internalSequence: number[] = [];
  #seState0: z3.BitVec | undefined;
  #seState1: z3.BitVec | undefined;
  #s0Ref: z3.BitVec | undefined;
  #s1Ref: z3.BitVec | undefined;
  #solver: z3.Solver | undefined;
  #context: z3.Context | undefined;

  public sequence: number[] = [];

  constructor(sequence: number[]) {
    this.sequence = sequence;
    this.#internalSequence = [...sequence];
  }

  async #initialize() {
    if (this.#isInitialized) {
      return true;
    }
    try {
      const { Context } = await z3.init();
      this.#context = Context("main");
      this.#isInitialized = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  #maskedStateSum(): z3.BitVec {
    return this.#seState0!.add(this.#seState1!).and(this.#context!.BitVec.val(0x1fffffffffffff, 64));
  }

  async #solveSymbolicState(): Promise<number> {
    try {
      if (!(await this.#initialize()) || !this.#context) {
        throw new Error("[Firefox] Not initialized!");
      }

      const ctx = this.#context;
      this.#solver = new ctx.Solver();
      this.#seState0 = ctx.BitVec.const("se_state0", 64);
      this.#seState1 = ctx.BitVec.const("se_state1", 64);
      this.#s0Ref = this.#seState0;
      this.#s1Ref = this.#seState1;

      for (let i = 0; i < this.#internalSequence.length; i++) {
        this.#xorShift128PlusSymbolic(this.#seState0, this.#seState1);
        const mantissa = this.#recoverMantissa(this.#internalSequence[i]);
        this.#solver.add(this.#maskedStateSum().eq(ctx.BitVec.val(mantissa, 64)));
      }

      const check = await this.#solver.check();
      if (check !== "sat") {
        return Promise.reject("Unsat");
      }

      const model = this.#solver.model();
      // One more step to get the next prediction
      this.#xorShift128PlusSymbolic(this.#seState0, this.#seState1);
      return this.#toDouble(model.eval(this.#maskedStateSum(), true).value());
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Predict next random number.
   * @returns {Promise<number>}
   */
  public async predictNext(): Promise<number> {
    const next = await this.#solveSymbolicState();
    this.#internalSequence.push(next);
    // Only keep last 4 numbers since that seems to be what we need to successfully predict.
    if (this.#internalSequence.length > 4) {
      this.#internalSequence.splice(0, this.#internalSequence.length - 4);
    }
    return next;
  }

  #xorShift128PlusSymbolic(state0: z3.BitVec, state1: z3.BitVec) {
    let s1 = state0;
    let s0 = state1;
    s1 = s1.xor(s1.shl(23));
    s1 = s1.xor(s1.lshr(17));
    s1 = s1.xor(s0);
    s1 = s1.xor(s0.lshr(26));
    this.#seState0 = this.#seState1;
    this.#seState1 = s1;
  }

  #recoverMantissa(double: number): bigint {
    return BigInt(Math.floor(double * Math.pow(2, 53)));
  }

  #toDouble(n: bigint): number {
    return Number(n & 0x1fffffffffffffn) / Number(1n << 53n);
  }
}
