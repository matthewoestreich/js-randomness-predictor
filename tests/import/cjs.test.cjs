const test = require("node:test");
const assert = require("node:assert");

const JSRandomnessPredictor = require("../../dist/cjs/builds/cjs.js");

test("CJS build can be required", () => {
  assert.ok(JSRandomnessPredictor, "CJS require should return something");
  assert.equal(typeof JSRandomnessPredictor.node, "function");
});
