import * as z3 from "z3-solver-jsrp";
import { InsufficientSequenceLengthError, UnsatError } from "../errors.js";
import { ConcreteXorShiftFn, Pair, SolvingStrategy, SymbolicXorShiftFn, XorShiftStrategy } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import uint64 from "../uint64.js";

// Huge shout out https://blog.drstra.in/posts/jsc-randomness-predictor/

export default class SafariRandomnessPredictor {
  public sequence: number[];

  #minimumSequenceLength = 6;
  #concreteState: Pair<bigint> = [0n, 0n];

  // The mantissa bits (53 effective bits = 52 stored + 1 implicit) for doubles as defined in IEEE-754
  #IEEE754_MANTISSA_BITS_MASK = 0x1fffffffffffffn;
  // Map a 53-bit integer into the range [0, 1) as a double.
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #xorStrategy: XorShiftStrategy;

  #xorStrategies: XorShiftStrategy[] = [
    // Try first using arithmetic right shifts.
    {
      symbolic: (s: Pair<z3.BitVec>) => XorShift128Plus.symbolicArithmeticShiftRight(s),
      concrete: (s: Pair<bigint>) => XorShift128Plus.concreteArithmeticShiftRight(s),
    },
    // Try second with logical right shifts.
    {
      symbolic: (s: Pair<z3.BitVec>) => XorShift128Plus.symbolic(s),
      concrete: (s: Pair<bigint>) => XorShift128Plus.concrete(s),
    },
  ];

  constructor(sequence: number[]) {
    if (sequence.length < this.#minimumSequenceLength) {
      throw new InsufficientSequenceLengthError(`sequence length must be >= 6 : got ${sequence.length}`);
    }
    this.#xorStrategy = this.#xorStrategies[0];
    this.sequence = sequence;
  }

  public async predictNext(): Promise<number> {
    if (this.#concreteState[0] === 0n && this.#concreteState[1] === 0n) {
      await this.#solveWithXorStrategies();
    }
    // Modify concrete state before calculating our next prediction.
    this.#xorStrategy.concrete(this.#concreteState);
    return this.#toDouble(uint64(this.#concreteState[0] + this.#concreteState[1]));
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
        this.#xorStrategy.symbolic(symbolicState);
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
        this.#xorStrategy.concrete(concreteStatePair);
      }

      this.#concreteState = concreteStatePair;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async #solveWithXorStrategies(): Promise<void> {
    let lastUnsatError: undefined | UnsatError;

    for (const strategy of this.#xorStrategies) {
      try {
        this.#xorStrategy = strategy;
        return await this.#solveSymbolicState();
      } catch (e) {
        // If we have an error that isn't Unsat, we need to throw it.
        // We only want to try the next xor strategy if we get Unsat.
        if (!(e instanceof UnsatError)) {
          throw e;
        }
        lastUnsatError = e;
      }
    }

    throw lastUnsatError ?? new Error("No XOR strategy attempted");
  }

  #recoverMantissa(n: number): bigint {
    return BigInt(Math.floor(n * this.#SCALING_FACTOR_53_BIT_INT));
  }

  #toDouble(n: bigint): number {
    return Number(n & this.#IEEE754_MANTISSA_BITS_MASK) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
