// Simulates C/C++ uint64 overflow (wrapping).
export default function uint64(n: bigint): bigint {
  // '0xffffffffffffffffn' is a 64 bit mask to wrap a BigInt as an unsigned 64 bit integer (uint64)
  return n & 0xffffffffffffffffn;
}
