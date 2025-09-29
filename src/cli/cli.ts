#!/usr/bin/env node

/**
 * This file is the entry point for the CLI!
 */
import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from "node:child_process";
import nodepath from "node:path";
import { ServerRuntimeType, EXECUTION_RUNTIME_ENV_VAR_KEY } from "../types.js";

// Node is our default execution runtime.
const executionRuntime = (process.env[EXECUTION_RUNTIME_ENV_VAR_KEY] as ServerRuntimeType) || "node";
const js_randomness_predictor = nodepath.resolve(import.meta.dirname, "./js-randomness-predictor.js");

// These are the args that a user provided to js-randomness-predictor CLI.
const jsrpArgs = process.argv.slice(2);
// These are the args for the child process we are about to run.
const finalArgs = [js_randomness_predictor, ...jsrpArgs];
// Options for child process we are about to run.
const childProcessOptions: SpawnSyncOptionsWithBufferEncoding = { stdio: "inherit" };

// Deno is so special!
if (executionRuntime === "deno") {
  // Deno needs an import map...smh
  const importMap = nodepath.resolve(import.meta.dirname, "./deno_import_map.json");

  // Deno forces us to put the "--allow-*" commands PRIOR to the script!
  // So the command ultimately becomes:
  // `deno --allow-env --allow-read js-randomness-predictor.js <rest_of_cli_args>`
  finalArgs.unshift("--allow-env", "--allow-read", `--import-map=${importMap}`);

  // So we can use imports that arent prefixed with "npm:", eg `import x from "npm:x"`
  childProcessOptions.env = {
    ...process.env,
    DENO_COMPAT: "1",
  };
}

spawnSync(executionRuntime.toString(), finalArgs, childProcessOptions);
