const JsRandomnessPredictor = require("../dist/cjs/index.js");

/**
 * This script is used in a GitHub action that is meant to
 * test a wide variety of Node versions.
 *
 * Since we use node:test for our main tests, and it is not
 * available in Node.js versions <18, we have to use a script
 * to test versions.
 */

(async () => {
  const seq = Array.from({ length: 4 }, Math.random);
  const nodePredictor = JsRandomnessPredictor.node(seq);
  const expected = Array.from({ length: 10 }, Math.random);

  const predictions = [];
  for (let i = 0; i < 10; i++) {
    const prediction = await nodePredictor.predictNext();
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
