import JSRandomnessPredictor from "../../src";

Main();

async function Main() {
  const nodePred = JSRandomnessPredictor.node();
  console.log((await nodePred.predictNext()) === Math.random());
}
