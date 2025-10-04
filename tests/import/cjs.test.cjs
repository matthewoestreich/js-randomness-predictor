const test = require("node:test");
const assert = require("node:assert");

const JSRandomnessPredictor = require("../../dist/cjs/cjs.js");

test("CJS build can be required", () => {
  JSRandomnessPredictor.bun();
  assert.ok(JSRandomnessPredictor, "CJS require should return something");
  assert.equal(typeof JSRandomnessPredictor.node, "function");
});
