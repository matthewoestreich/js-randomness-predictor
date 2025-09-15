import { BitVec } from "z3-solver";
import { Pair } from "./types.js";
import uint64 from "./uint64.js";

// Encapsulate all XorShift128+ methods here.

export default class XorShift128Plus {
  // Modifies symbolicState! Performs XORShift128+ on symbolic state (z3).
  symbolic(symbolicState: Pair<BitVec>): void {
    let temp = symbolicState[0];
    temp = temp.xor(temp.shl(23));
    temp = temp.xor(temp.lshr(17));
    temp = temp.xor(symbolicState[1]);
    temp = temp.xor(symbolicState[1].lshr(26));
    // Order matters here!
    // First, move symbolic state 1 into symbolic state 0. This moves state "backwards", thus
    // allowing us to solve the PRNG seed(s).
    symbolicState[0] = symbolicState[1];
    // Last, update symbolic state 1 with our temp state value.
    symbolicState[1] = temp;
  }

  // Modifies `concreteState`! Performs XORShift128+ backwards on concrete state, due to how V8 provides random numbers.
  concreteBackwards(concreteState: Pair<bigint>): void {
    let temp = concreteState[1] ^ (concreteState[0] >> 26n) ^ concreteState[0];
    // Undo the right-shift/xor steps from forward XORShift128+ to recover the previous state
    temp = uint64(temp ^ (temp >> 17n) ^ (temp >> 34n) ^ (temp >> 51n));
    // Undo the left-shift/xor steps from forward XORShift128+ to recover the previous state
    temp = uint64(temp ^ (temp << 23n) ^ (temp << 46n));
    // Order matters here!!
    // First, assign concrete state 1 to the value of concrete state 0. This moves state forward, but since we
    // are performing XorShift128+ backwards, we assign concrete state 1 first.
    concreteState[1] = concreteState[0];
    // Last, update concrete state 0 with our temp state value.
    concreteState[0] = temp;
  }

  // Modifies concreteState.
  concrete(concreteState: Pair<bigint>): void {
    let temp = concreteState[0];
    temp ^= uint64(temp << 23n);
    temp ^= uint64(temp >> 17n);
    temp ^= concreteState[1];
    temp ^= uint64(concreteState[1] >> 26n);
    // Order matters here!!
    // First, assign concrete state 0 to the value of concrete state 1. This moves state forward.
    concreteState[0] = concreteState[1];
    // Last, update concrete state 0 with our temp state value.
    concreteState[1] = temp;
  }
}
