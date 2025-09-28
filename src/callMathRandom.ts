export default function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}
