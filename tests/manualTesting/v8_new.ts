import V8RandomnessPredictor from "../../src/predictors/Node";

Main();
async function Main() {
  const v8 = new V8RandomnessPredictor();
  const expected = Array.from({ length: 40 }, Math.random);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await v8.predictNext());
  }
  console.log({
    sequence: v8.sequence,
    predictions,
    actual: expected,
    isCorrect: predictions.every((v, i) => v === expected[i]),
  });
}
