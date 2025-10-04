const JsRandomnessPredictor = require("../../../dist/cjs/cjs.js");

/**
 * This script is designed to be used in GitHub Actions.
 *
 * Since `node:test` came out in Node v20 we can't use it in versions 17-19.
 * Therefore, we have to use this script.
 */

const INITIAL_SEQUENCE_LEN = 4;
const EXPECTED_PREDICTIONS_LEN = 10;
const NODE_MAJOR_VERSION = Number(process.versions.node.split(".")[0]);
const EXIT = { code: 0 };

const hashTags = (n = 1) => "#".repeat(n);

console.log(`${hashTags(100)}\nNode.js : Test Versions Without \`node:test\`.`);
console.log(`Tests using auto-generated sequence.`);
console.log(`This script exists because 'node:test' does not exist in v17-v19.`);
console.log(`Meant for Node.js versions 17-19 | Current version=${NODE_MAJOR_VERSION}\n${hashTags(100)}`);

if (NODE_MAJOR_VERSION > 19 || NODE_MAJOR_VERSION < 17) {
  const condition = NODE_MAJOR_VERSION < 17 ? "< 17" : "> 19";
  console.log(`[SKIPPING] Current Node Version is ${condition}, making this test redundant.\n${hashTags(100)}`);
  process.exit(EXIT.code);
}

// Invoke script/main method.
Main();

async function Main() {
  const sequence = Array.from({ length: INITIAL_SEQUENCE_LEN }, Math.random);
  const predictor = JsRandomnessPredictor.node(sequence);
  const expected = Array.from({ length: EXPECTED_PREDICTIONS_LEN }, Math.random);

  const predictions = [];
  for (let i = 0; i < expected.length; i++) {
    const prediction = await predictor.predictNext();
    predictions.push(prediction);
  }

  // Assume success by default.
  const output = { sequence, predictions, expected, result: `[SUCCESS] Predictions are accurate.` };

  if (!expected.every((v, i) => predictions[i] === v)) {
    output.result = `[FAILURE] Predictions not accurate.`;
    EXIT.code = 1;
  }

  console.log(output);
  process.exit(EXIT.code);
}
