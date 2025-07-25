const JsRandomnessPredictor = require("../dist/cjs/index.js");

/**
 * This script is used in GitHub Actions.
 *
 * Since `node:test` came out in Node v20 we can't use it in versions 17-19.
 * Therefore, we have to use this script.
 */

const INITIAL_SEQUENCE_LEN = 4;
const EXPECTED_PREDICTIONS_LEN = 10;
const NODE_MAJOR_VERSION = Number(process.versions.node.split(".")[0]);

console.log(`${"#".repeat(100)}\nTesting Node.js v${NODE_MAJOR_VERSION} with an auto generated sequence & expected\n${"#".repeat(100)}`);

(async () => {
  const seq = Array.from({ length: INITIAL_SEQUENCE_LEN }, Math.random);
  const predictor = JsRandomnessPredictor.node(seq);
  const expected = Array.from({ length: EXPECTED_PREDICTIONS_LEN }, Math.random);

  const predictions = [];
  for (let i = 0; i < expected.length; i++) {
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
