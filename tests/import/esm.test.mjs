import test from "node:test";
import assert from "node:assert";

import lib from "../../dist/esm/esm.js";

test("ESM build can be imported", async () => {
  assert.ok(lib, "ESM import should return something");
  assert.equal(typeof lib.node, "function");
});
