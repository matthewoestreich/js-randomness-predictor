import JSRandomnessPredictor from "../src";

const SEQ_GEN_IN_V_22 = [0.6741138824350359, 0.3952693448013418, 0.2364392230042982, 0.19928567609774994];
const EXP_GEN_IN_V_22 = [0.42090241809523987, 0.602480621528513, 0.8144029534899446, 0.0406815112412624, 0.00198684380476144, 0.30686059799018595];
const SEQ_GEN_IN_V_24 = [0.41518030339861356, 0.4685521467820831, 0.3217023983039654, 0.5212046656627617];
const EXP_GEN_IN_V_24 = [0.6807144253791263, 0.6236518270040349, 0.9584939203835657, 0.9413626911217433, 0.31348852342163247, 0.3437278230034495];

Main();

async function Main() {
  const v8_v24 = JSRandomnessPredictor.v8(SEQ_GEN_IN_V_24);
  const v8_v24_NextPred = await v8_v24.predictNext();
  console.log({
    version: "v24.2.0",
    v8Seq: v8_v24.sequence,
    v8NextPred: v8_v24_NextPred,
    actualMathRandom: EXP_GEN_IN_V_24[0],
    isCorrect: v8_v24_NextPred === EXP_GEN_IN_V_24[0],
  });

  const v8_v22 = JSRandomnessPredictor.v8(SEQ_GEN_IN_V_22);
  v8_v22.setNodeVersion({ major: 22, minor: 0, patch: 0 });
  const v8_v22_NextPred = await v8_v22.predictNext();
  console.log({
    version: "v22.0.0",
    v8Seq: v8_v22.sequence,
    v8NextPred: v8_v22_NextPred,
    actualMathRandom: EXP_GEN_IN_V_22[0],
    isCorrect: v8_v22_NextPred === EXP_GEN_IN_V_22[0],
  });

  const v8 = JSRandomnessPredictor.v8();
  const NUM_PREDS = 10;
  const predictions: number[] = [];
  for (let i = 0; i < NUM_PREDS; i++) {
    predictions.push(await v8.predictNext());
  }
  const actuals = Array.from({ length: NUM_PREDS }, Math.random);
  console.log({
    version: `Dynamic:UsesCurrentVersion:v${process.versions.node}`,
    v8Seq: v8.sequence,
    predictions,
    actuals,
    isCorrect: predictions.every((v, i) => v === actuals[i]),
  });
}
