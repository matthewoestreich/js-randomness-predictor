const test = require("node:test");
const assert = require("node:assert");

test("CJS build can be required", () => {
  const lib = require("../../dist/cjs/index.js");
  assert.ok(lib, "CJS require should return something");
  assert.equal(typeof lib.node, "function");
});
