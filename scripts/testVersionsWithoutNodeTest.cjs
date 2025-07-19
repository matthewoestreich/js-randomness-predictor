const JsRandomnessPredictor = require("../dist/cjs/index.js");

/**
 * This script is used in GitHub Actions.
 *
 * Since `node:test` came out in Node v20 we can't use it in versions 17-19.
 * Therefore, we have to use this script.
 */

const NODE_MAJOR_VERSION = Number(process.versions.node.split(".")[0]);

if (NODE_MAJOR_VERSION < 17 || NODE_MAJOR_VERSION > 20) {
  console.log(`Only versions >= 17 and <= 20 are supported! Current version : ${NODE_MAJOR_VERSION}`);
  process.exit(1);
}

(async () => {
  const seq = Array.from({ length: 4 }, Math.random);
  const predictor = JsRandomnessPredictor.node(seq);
  const expected = Array.from({ length: 10 }, Math.random);

  const predictions = [];
  for (let i = 0; i < 10; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  if (expected.every((v, i) => predictions[i] === v)) {
    console.log({ predictions, expected, result: `[SUCCESS] Predictions are accurate.` });
    process.exit(0);
  } else {
    console.log({ predictions, expected, result: `[FAILURE] Predictions not accurate.` });
    process.exit(1);
  }
})();
