import { BunRandomnessPredictor } from "../../src/predictors";

function callMathRandom(nTimes = 1): number[] {
  const o: number[] = [];
  for (let i = 0; i < nTimes; i++) {
    o.push(Math.random());
  }
  return o;
}

const b = new BunRandomnessPredictor();
const e = callMathRandom(100);
const p: number[] = [];

for (const _ in e) {
  const g = await b.predictNext();
  p.push(g);
}

console.log({
  expected: e,
  predictions: p,
  "correct?": p.every((v, i) => v === e[i]),
});
