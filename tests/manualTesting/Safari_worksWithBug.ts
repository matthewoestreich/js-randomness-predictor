/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
// safariPredictor.ts
import * as z3 from "z3-solver";
import XorShift128Plus from "../../src/XorShift128Plus.js";

export default class SafariRandomnessPredictor_worksWithBug {
  sequence: number[];

  constructor(sequence: number[]) {
    this.sequence = sequence;
  }

  /**
   * Solve for initial (m_low, m_high) using Z3 and the observed sequence.
   * Returns { low: bigint, high: bigint } corresponding to the model values.
   */
  async solveState(): Promise<{ low: bigint; high: bigint }> {
    const { Context } = await z3.init();
    const ctx = Context("main");
    const solver = new ctx.Solver();

    // Fresh symbolic variables
    const ss0 = ctx.BitVec.const("ss0", 64); // se_state0 (m_low start)
    const ss1 = ctx.BitVec.const("ss1", 64); // se_state1 (m_high start)
    const symbolicState: [any, any] = [ss0, ss1];

    const MASK = ctx.BitVec.val((1n << 53n) - 1n, 64);

    // Add constraints for every observed number
    for (let i = 0; i < this.sequence.length; ++i) {
      const observed = this.sequence[i];

      // Advance symbolic state one step (mutates symbolicState)
      XorShift128Plus.symbolicArithmeticShiftRight(symbolicState);

      // sum = m_high + m_low (BitVec addition, wraps mod 2^64)
      let sum = symbolicState[1].add(symbolicState[0]);
      sum = sum.and(MASK);

      // recover mantissa using same rule as python
      const mantissa = this.#recoverMantissa(observed);
      // Add constraint: sum == mantissa
      solver.add(sum.eq(ctx.BitVec.val(mantissa, 64)));
    }

    const result = await solver.check();
    if (result !== "sat") {
      throw new Error("Z3: unsat or unknown while solving initial state");
    }

    const model = solver.model();

    // obtain concrete model values
    // model.get(ss0) / model.get(ss1) should exist
    const lowBV = model.get(ss0);
    const highBV = model.get(ss1);

    // depending on z3-solver version these objects have `.value()` returning BigInt
    const lowVal = (lowBV as any).value() as bigint;
    const highVal = (highBV as any).value() as bigint;

    // debug print - shows the solved state in decimal and hex
    console.log("[Z3] solved low:", lowVal.toString(), "hex:", "0x" + lowVal.toString(16));
    console.log("[Z3] solved high:", highVal.toString(), "hex:", "0x" + highVal.toString(16));

    return { low: lowVal, high: highVal };
  }

  #recoverMantissa(n: number): bigint {
    const scaled = n * Math.pow(2, 53);
    return BigInt(scaled);
  }

  /**
   * Advance function in JS using BigInt to match your C++ algorithm.
   * Returns [newLow, newHigh, sum]
   */
  // THIS IS XORSHIFTCONCRETE
  static advanceState(low: bigint, high: bigint): [bigint, bigint, bigint] {
    // emulate 64-bit wrapping
    const MASK64 = (1n << 64n) - 1n;

    let x = low & MASK64;
    const y = high & MASK64;
    const newLow = y;

    // x ^= x << 23
    x = x ^ ((x << 23n) & MASK64);
    // x ^= x >> 17  -> arithmetic shift: for BigInt we need to emulate sign?
    // But these are uint64 semantics in your PRNG. For the bitwise operations with BigInt, use mask tricks.
    // We can implement arithmetic right shift on 64-bit two's complement:
    const signMask = 1n << 63n;
    const x_sign = (x & signMask) !== 0n;
    // logical right shift:
    const lshr17 = (x >> 17n) & MASK64;
    // if sign, fill top bits with ones
    const ashr17 = x_sign ? (lshr17 | (((1n << 17n) - 1n) << (64n - 17n))) & MASK64 : lshr17;

    x = x ^ ashr17;

    // x ^= y
    x = x ^ y;

    // x ^= y >> 26 (arithmetic right shift of y)
    const y_sign = (y & signMask) !== 0n;
    const y_lshr26 = (y >> 26n) & MASK64;
    const y_ashr26 = y_sign ? (y_lshr26 | (((1n << 26n) - 1n) << (64n - 26n))) & MASK64 : y_lshr26;

    x = x ^ y_ashr26;

    const newHigh = x & MASK64;
    const sum = (newHigh + newLow) & MASK64;

    return [newLow, newHigh, sum];
  }

  /**
   * Given solved initial state, advance it through the observed sequence length
   * and return an array of the next `count` predicted doubles (matching your C++ get()).
   */
  static predictFromSolvedState(initialLow: bigint, initialHigh: bigint, observedLen: number, predictCount = 10): number[] {
    let low = initialLow;
    let high = initialHigh;

    // Advance to consume observed sequence (Z3 returns state at sequence start)
    for (let i = 0; i < observedLen; ++i) {
      [low, high] = [this.advanceState(low, high)[0], this.advanceState(low, high)[1]];
      // Note: advanceState called twice above would double-advance incorrectly - we'll fix below with clearer code
    }

    // The above double-call is wrong; replace with correct advance:
    // We'll recalc properly using a new loop for safety
    low = initialLow;
    high = initialHigh;
    for (let i = 0; i < observedLen; ++i) {
      const [newLow, newHigh] = this.advanceState(low, high);
      low = newLow;
      high = newHigh;
    }

    // Now produce predictions
    const out: number[] = [];
    const SCALE = 1 / Number(1n << 53n);
    for (let i = 0; i < predictCount; ++i) {
      console.log({ concreteState_before: { low, high } });
      const [newLow, newHigh, sum] = this.advanceState(low, high);
      low = newLow;
      high = newHigh;
      console.log({ concreteState_after: { low: newLow, high: newHigh } });
      const mantissa = Number(sum & ((1n << 53n) - 1n));
      const dbl = mantissa * SCALE;
      console.log(dbl);
      out.push(dbl);
    }
    return out;
  }
}
