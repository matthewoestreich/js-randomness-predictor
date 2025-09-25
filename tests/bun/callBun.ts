import { spawnSync, SpawnSyncReturns } from "node:child_process";
import crypto from "node:crypto";
import nodePath from "node:path";
import nodeFs from "node:fs";

export default function callBun(evaluate: string, deleteOutputFile = true): SpawnSyncReturns<string> {
  const fileName = `${crypto.randomBytes(16).toString("hex")}.js`;
  const filePath = nodePath.resolve(import.meta.dirname, "./", fileName);

  nodeFs.writeFileSync(filePath, evaluate);

  if (!nodeFs.existsSync(filePath)) {
    throw new Error(`Unable to run command! Temp file not created!`);
  }

  const output = spawnSync("bun", ["run", filePath], { encoding: "utf8" });

  if (deleteOutputFile) {
    nodeFs.rmSync(filePath);
  }

  return output;
}
