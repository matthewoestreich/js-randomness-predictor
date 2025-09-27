// This file exists due to a bug in JavaScriptCore.
// See here for more https://github.com/WebKit/WebKit/pull/51077

export default function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}
