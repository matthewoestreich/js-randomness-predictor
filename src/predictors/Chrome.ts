import * as z3 from "z3-solver";
import { UnsatError } from "../errors.js";

export default class ChromeRandomnessPredictor {
  #isInitialized = false;
  #mask = 0xffffffffffffffffn;
  #concreteState0: bigint | undefined;
  #concreteState1: bigint | undefined;
  #context: z3.Context | undefined;
  #solver: z3.Solver | undefined;
  #seState0: z3.BitVec | undefined;
  #seState1: z3.BitVec | undefined;
  #s0Ref: z3.BitVec | undefined;
  #s1Ref: z3.BitVec | undefined;

  public sequence: number[] | undefined = undefined;

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

      const reversedSequence = [...(this.sequence || [])].reverse();

      for (const value of reversedSequence) {
        this.#xorShift128pSymbolic();
        const mantissa = this.#recoverMantissa(value);
        const state0Shifted = this.#context.BitVec.val(mantissa, 64);
        this.#solver.add(this.#seState0!.lshr(11).eq(state0Shifted));
      }

      const result = await this.#solver.check();
      if (result !== "sat") {
        return Promise.reject(new UnsatError());
      }

      const model = this.#solver.model();
      this.#concreteState0 = (model.get(this.#s0Ref!) as z3.BitVecNum).value();
      this.#concreteState1 = (model.get(this.#s1Ref!) as z3.BitVecNum).value();

      this.#isInitialized = true;
      return true;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async predictNext(): Promise<number> {
    await this.#initialize();
    if (this.#concreteState0 === undefined || this.#concreteState1 === undefined) {
      throw new Error(`[Chrome Predictor] Concrete states not defined! Something went wrong.`);
    }
    return this.#toDouble(this.#xorShift128pConcreteBackwards());
  }

  #xorShift128pSymbolic(): void {
    if (!this.#seState0 || !this.#seState1) {
      throw new Error("[Chrome Predictor] Symbolic states not initialized");
    }
    const se_s1 = this.#seState0;
    const se_s0 = this.#seState1;
    this.#seState0 = se_s0;
    let newS1 = se_s1.xor(se_s1.shl(23));
    newS1 = newS1.xor(newS1.lshr(17));
    newS1 = newS1.xor(se_s0);
    newS1 = newS1.xor(se_s0.lshr(26));
    this.#seState1 = newS1;
  }

  #xorShift128pConcreteBackwards(): bigint {
    const result = this.#concreteState0!;
    let ps1 = this.#concreteState0!;
    let ps0 = this.#concreteState1! ^ (ps1 >> 26n);
    ps0 ^= ps1;
    ps0 = (ps0 ^ (ps0 >> 17n) ^ (ps0 >> 34n) ^ (ps0 >> 51n)) & this.#mask;
    ps0 = (ps0 ^ (ps0 << 23n) ^ (ps0 << 46n)) & this.#mask;
    this.#concreteState0 = ps0;
    this.#concreteState1 = ps1;
    return result;
  }

  #recoverMantissa(double: number): bigint {
    return BigInt(Math.floor(double * Number(1n << 53n)));
  }

  #toDouble(val: bigint): number {
    return Number(val >> 11n) / Math.pow(2, 53);
  }
}
