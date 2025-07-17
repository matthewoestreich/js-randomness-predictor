const JsRandomnessPredictor = require("../dist/cjs/index.js");
const randomNumbers = require("./random-numbers.json");

/**
 * This script is used in a GitHub action that is meant to
 * test a wide variety of Node versions.
 *
 * Since we use node:test for our main tests, and it is not
 * available in Node.js versions <18, we have to use a script
 * to test versions.
 */

// The only arg we expect is one in the followng format : '14.x'
// It represents the Node.js version.

let VERSION = null;

const arg_version = process.argv[2];
if (arg_version) {
  VERSION = Number(arg_version.split(".")[0]);
}

(async () => {
  let sequence = Array.from({ length: 4 }, Math.random);
  let expected = Array.from({ length: 10 }, Math.random);
  let predictor = JsRandomnessPredictor.node(sequence);

  console.log({ v8_version: process.versions.v8 });
  console.log({ sequence });

  if (VERSION !== null && VERSION <= 16) {
    const randsForThisVersion = randomNumbers.find((r) => r.nodeVersion === VERSION);
    const noCustomSeed = randsForThisVersion.randomNumbers.find((r) => r.isCustomSeed === false);
    sequence = noCustomSeed.sequence;
    expected = noCustomSeed.expected;
    predictor = JsRandomnessPredictor.node(sequence);
    predictor.setNodeVersion({ major: VERSION, minor: 0, patch: 0 });
    console.log(`[VERSION <= 16] Testing Node.js v${VERSION}`);
  } else {
    console.log(`Testing Node.js v${process.versions.node.split(".")[0]}`);
  }

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
