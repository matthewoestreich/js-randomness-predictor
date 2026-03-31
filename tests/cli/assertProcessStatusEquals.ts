import assert from "node:assert";
import { SpawnSyncReturns } from "node:child_process";

export default function assertProcessStatusEquals(result: SpawnSyncReturns<string>, expectedStatus: number): void {
  assert.equal(
    result.status,
    expectedStatus,
    `Expected status ${expectedStatus} got ${result.status} :: Full results : \n${JSON.stringify(result, null, 2)}`,
  );
}
