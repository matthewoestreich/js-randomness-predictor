import assert from "node:assert";
import { SpawnSyncReturns } from "node:child_process";

export default {
  equals: (result: SpawnSyncReturns<string>, equals: number): void => {
    assert.equal(result.status, equals, `Expected status ${equals} got ${result.status} :: Full results : \n${JSON.stringify(result, null, 2)}`);
  },
  notEquals: (result: SpawnSyncReturns<string>, notEquals: number): void => {
    assert.equal(
      result.status,
      notEquals,
      `Expected status to not equal ${notEquals} but it does. Got ${result.status} :: Full results : \n${JSON.stringify(result, null, 2)}`,
    );
  },
};
