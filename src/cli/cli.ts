#!/usr/bin/env node
import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from "node:child_process";
import nodepath from "node:path";
import { ServerRuntimeType } from "../types.js";

const RUNTIME_ENV_VAR_NAME = "JSRP_RUNTIME";
const SCRIPT_TO_RUN_RELATIVE_PATH = "./js-randomness-predictor.js";

const runtime = (process.env[RUNTIME_ENV_VAR_NAME] as ServerRuntimeType) || "node"; // default to Node
const script = nodepath.resolve(import.meta.dirname, SCRIPT_TO_RUN_RELATIVE_PATH);

const cliArgs = process.argv.slice(2);
const finalArgs = [script, ...cliArgs];

const childProcessOptions: SpawnSyncOptionsWithBufferEncoding = { stdio: "inherit" };

if (runtime === "deno") {
  // So the command ultimately becomes:
  // `deno --allow-env --allow-read js-randomness-predictor.js <rest_of_cli_args>`
  // Deno forces us to put the "--allow-*" commands PRIOR to the script!
  finalArgs.unshift("--allow-env", "--allow-read");
  // So we can use imports that arent prefixed with "npm:", eg `import x from "npm:x"`
  childProcessOptions.env = {
    ...process.env,
    DENO_COMPAT: "1",
  };
}

spawnSync(runtime.toString(), finalArgs, childProcessOptions);
