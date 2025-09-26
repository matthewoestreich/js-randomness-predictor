import * as z3 from "z3-solver";
import { InsufficientSequenceLengthError, UnsatError } from "../errors.js";
import { ConcreteXorShiftFn, Pair, SymbolicXorShiftFn } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import uint64 from "../uint64.js";

// Huge shout out https://blog.drstra.in/posts/jsc-randomness-predictor/

export default class SafariRandomnessPredictor {
  public sequence: number[];

  #minimumSequenceLength = 6;
  #concreteState: Pair<bigint> = [0n, 0n];
  #symbolicXor: SymbolicXorShiftFn;
  #concreteXor: ConcreteXorShiftFn;

  // The mantissa bits (53 effective bits = 52 stored + 1 implicit) for doubles as defined in IEEE-754
  #IEEE754_MANTISSA_BITS_MASK = 0x1fffffffffffffn;
  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);

  constructor(sequence: number[]) {
    if (sequence.length < this.#minimumSequenceLength) {
      throw new InsufficientSequenceLengthError(`sequence length must be >= 6 : got ${sequence.length}`);
    }
    this.#symbolicXor = (s: Pair<z3.BitVec>) => XorShift128Plus.symbolicArithmeticShiftRight(s);
    this.#concreteXor = (s: Pair<bigint>) => XorShift128Plus.concreteArithmeticShiftRight(s);
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#withRetry(
        () => this.#solveSymbolicState(),
        () => {
          // Retry with logical right shifts
          this.#symbolicXor = (s: Pair<z3.BitVec>) => XorShift128Plus.symbolic(s);
          this.#concreteXor = (s: Pair<bigint>) => XorShift128Plus.concrete(s);
          return this.#solveSymbolicState();
        },
      );
    }
    // Modify concrete state before calculating our next prediction.
    this.#concreteXor(this.#concreteState);
    return this.#toDouble(uint64(this.#concreteState[0] + this.#concreteState[1]));
  }

  async #withRetry<BT, RT>(baseFn: () => Promise<BT>, retryFn: () => Promise<RT>): Promise<BT | RT> {
    try {
      return await baseFn();
    } catch (_e: unknown) {
      return await retryFn();
    }
  }

  async #solveSymbolicState(): Promise<void> {
    try {
      const { Context } = await z3.init();
      const context = Context("main");
      const solver = new context.Solver();
      const symbolicState0 = context.BitVec.const("ss0", 64);
      const symbolicState1 = context.BitVec.const("ss1", 64);
      const symbolicState: Pair<z3.BitVec> = [symbolicState0, symbolicState1];

      for (const n of this.sequence) {
        this.#symbolicXor(symbolicState);
        const mantissa = this.#recoverMantissa(n);
        const sum = symbolicState[0].add(symbolicState[1]).and(context.BitVec.val(this.#IEEE754_MANTISSA_BITS_MASK, 64));
        solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
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

      // Advance concrete state to the next unseen number. Z3 returns state at sequence start,
      // so we have to advance concrete state up to the same point as our initial sequence length.
      for (const _ of this.sequence) {
        this.#concreteXor(concreteStatePair);
      }

      this.#concreteState = concreteStatePair;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  #recoverMantissa(n: number): bigint {
    return BigInt(Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT));
  }

  #toDouble(n: bigint): number {
    return Number(n & this.#IEEE754_MANTISSA_BITS_MASK) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
