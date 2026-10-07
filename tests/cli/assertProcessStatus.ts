import assert from "node:assert";
import { SpawnSyncReturns } from "node:child_process";

export default {
  equal: (result: SpawnSyncReturns<string>, equals: number): void => {
    assert.equal(
      result.status,
      equals,
      [
        `Expected status ${equals}, got ${result.status}`,
        `stdout:\n${result.stdout}`,
        `stderr:\n${result.stderr}`,
        `error:\n${result.error?.message ?? "none"}`,
      ].join("\n"),
    );
  },

  notEqual: (result: SpawnSyncReturns<string>, notEquals: number): void => {
    assert.notEqual(
      result.status,
      notEquals,
      [
        `Expected status to not equal ${notEquals}, but it does.`,
        `stdout:\n${result.stdout}`,
        `stderr:\n${result.stderr}`,
        `error:\n${result.error?.message ?? "none"}`,
      ].join("\n"),
    );
  },
};

/*
export default {
  equal: (result: SpawnSyncReturns<string>, equals: number): void => {
    assert.equal(result.status, equals, `Expected status ${equals} got ${result.status} :: Full results : \n${JSON.stringify(result, null, 2)}`);
  },
  notEqual: (result: SpawnSyncReturns<string>, notEquals: number): void => {
    assert.notEqual(
      result.status,
      notEquals,
      `Expected status to not equal ${notEquals} but it does. Got ${result.status} :: Full results : \n${JSON.stringify(result, null, 2)}`,
    );
  },
};
*/
