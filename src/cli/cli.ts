#!/usr/bin/env node

/**
 * This file is the entry point for the CLI!
 *
 * DRY RUN:
 *  - You can use an env var "process.env.JSRP_DRY_RUN = '1'" to only test conditions up to the point where
 *  we are about to create a predictor, but we don't actually create one.
 *  - A dry run DOES NOT RUN THE PREDICTOR, so you will not have any predictions in results.
 */

import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from "node:child_process";
import nodepath from "node:path";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../types.js";

// Relative paths.
const denoImportMapRelative = "./deno_import_map.json";
const jsrpRelative = "./js-randomness-predictor.js";

// Node is our default execution runtime.
const executionRuntime = process.env[EXECUTION_RUNTIME_ENV_VAR_KEY] || "node";
const js_randomness_predictor = nodepath.resolve(import.meta.dirname, jsrpRelative);

// These are the args that a user provided to js-randomness-predictor CLI.
const jsrpArgs = process.argv.slice(2);
// These are the args for the child process we are about to run.
const childProcessArgs = [js_randomness_predictor, ...jsrpArgs];
// Options for child process we are about to run.
const childProcessOptions: SpawnSyncOptionsWithBufferEncoding = { stdio: "inherit", env: { ...process.env } };

// Deno is so special!
if (executionRuntime === "deno") {
  // Deno needs an import map...smh
  const importMap = nodepath.resolve(import.meta.dirname, denoImportMapRelative);

  // Deno forces us to put the "--allow-*" commands PRIOR to the script!
  // So the command ultimately becomes:`deno --allow-env --allow-read js-randomness-predictor.js <rest_of_cli_args>`
  childProcessArgs.unshift("--allow-env", "--allow-read", `--import-map=${importMap}`);

  // So we can use imports that arent prefixed with "npm:", eg `import x from "npm:x"`
  childProcessOptions.env!.DENO_COMPAT = "1";
}

// Freakin Windows, man...
// With 'shell: true' Windows will show DEP warnings about passing args.
// > (node:2164) [DEP0190] DeprecationWarning: Passing args to a child process with shell
// > option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
// > (Use `node --trace-deprecation ...` to show where the warning was created)
if (process.platform === "win32") {
  process.env.NODE_OPTIONS = "--no-deprecation";
  childProcessOptions.env!.NODE_OPTIONS = "--no-deprecation";
  childProcessOptions.shell = true;
}

spawnSync(executionRuntime.toString(), childProcessArgs, childProcessOptions);
