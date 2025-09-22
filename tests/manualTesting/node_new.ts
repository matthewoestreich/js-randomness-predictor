import { NodeRandomnessPredictor } from "../../src/predictors";

Main();
async function Main() {
  const node = new NodeRandomnessPredictor();
  const expected = Array.from({ length: 10 }, Math.random);
  const predictions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    predictions.push(await node.predictNext());
  }
  console.log({
    expected,
    got: predictions,
    isCorrect: expected.every((v, i) => v === predictions[i]),
  });
}
