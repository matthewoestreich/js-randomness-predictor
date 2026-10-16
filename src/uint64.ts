export default function uint64(n: bigint): bigint {
  return BigInt.asUintN(64, n);
}
