import test from "node:test";
import assert from "node:assert";

test("ESM build can be imported", async () => {
  const lib = await import("../../dist/esm/index.js");
  assert.ok(lib, "ESM import should return something");
  assert.equal(typeof lib.node, "function");
});