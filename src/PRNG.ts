import crypto from "node:crypto";
import XorShift128Plus from "./XorShift128Plus";
import { Pair } from "./types";
import uint64 from "./uint64";

// This file is not include in build.
// Just for testing a custom PRNG.

export default class PRNG {
  // Map a 53-bit integer into the range [0, 1) as a double
  #SCALING_FACTOR_53_BIT_INT = Math.pow(2, 53);
  #state: Pair<bigint>;
  #xorShift = new XorShift128Plus();

  constructor() {
    this.#state = this.#seed128();
  }

  random(): number {
    this.#xorShift.concrete(this.#state);
    return this.#toDouble(uint64(this.#state[0] + this.#state[1]));
  }

  #seed128(): Pair<bigint> {
    const buf = crypto.randomBytes(16);
    const s0 = buf.readBigUInt64LE(0);
    const s1 = buf.readBigUInt64LE(8);
    if (s0 === 0n && s1 === 0n) {
      return this.#seed128(); // avoid zero state
    }
    return [s0, s1];
  }

  #toDouble(n: bigint): number {
    return Number(n >> 11n) / this.#SCALING_FACTOR_53_BIT_INT;
  }
}
