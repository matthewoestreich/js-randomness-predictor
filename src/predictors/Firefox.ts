import * as z3 from "z3-solver-jsrp";
import { Pair, SolvingStrategy } from "../types.js";
import XorShift128Plus from "../XorShift128Plus.js";
import uint64 from "../uint64.js";
import SpiderMonkeyPredictor from "./engines/SpiderMonkey.js";
import { MANTISSA_53_BITS_MASK, SCALING_FACTOR_53_BIT_INT } from "../constants.js";

const FIREFOX_STRATEGIES: SolvingStrategy[] = [
  {
    recoverMantissa: (double: number): bigint => {
      return BigInt(Math.floor(double * SCALING_FACTOR_53_BIT_INT));
    },
    toDouble: (concreteState: Pair<bigint>): number => {
      const n = uint64(concreteState[0] + concreteState[1]);
      return Number(n & MANTISSA_53_BITS_MASK) / SCALING_FACTOR_53_BIT_INT;
    },
    constrainMantissa: (mantissa: bigint, symbolicState: Pair<z3.BitVec>, solver: z3.Solver, context: z3.Context): void => {
      const sum = symbolicState[0].add(symbolicState[1]).and(context!.BitVec.val(MANTISSA_53_BITS_MASK, 64));
      solver.add(sum.eq(context.BitVec.val(mantissa, 64)));
    },
    symbolicXorShift: (s: Pair<z3.BitVec>): void => XorShift128Plus.symbolic(s),
    concreteXorShift: (c: Pair<bigint>): void => XorShift128Plus.concrete(c),
  },
];

export default class FirefoxRandomnessPredictor extends SpiderMonkeyPredictor {
  constructor(sequence: number[]) {
    super(sequence, FIREFOX_STRATEGIES);
  }
}
