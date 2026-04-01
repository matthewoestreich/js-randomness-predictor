#!/usr/bin/env node

import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from "node:child_process";
import nodepath from "node:path";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../constants.js";

// Relative path(s).
const denoImportMapRelative = "./deno_import_map.json";
const jsrpRelative = "./js-randomness-predictor.js";
// Node is our default execution runtime.
const executionRuntime = process.env[EXECUTION_RUNTIME_ENV_VAR_KEY]?.trim() || "node";
const js_randomness_predictor = nodepath.resolve(import.meta.dirname, jsrpRelative);
// These are the args that a user provided to js-randomness-predictor CLI.
const jsrpArgs = process.argv.slice(2);
// This is essentially argv for the CLI.
const args = [js_randomness_predictor, ...jsrpArgs];

// Need child process for runtimes other than Node.
if (executionRuntime !== "node") {
  const childProcessOptions: SpawnSyncOptionsWithBufferEncoding = {
    stdio: "inherit",
    env: { ...process.env },
    shell: true, // Must be true for Windows...
  };

  if (executionRuntime === "deno") {
    // Deno needs an import map...smh
    const importMap = nodepath.resolve(import.meta.dirname, denoImportMapRelative);
    // Deno forces us to put the "--allow-*" commands PRIOR to the script!
    // So the command ultimately becomes:`deno --node-modules-dir --allow-env --allow-read js-randomness-predictor.js <rest_of_cli_args>`
    args.unshift("--node-modules-dir=auto", "--allow-env", "--allow-read", `--import-map=${importMap}`);
    // So we can use imports that arent prefixed with "npm:", eg `import x from "npm:x"`
    childProcessOptions.env!.DENO_COMPAT = "1";
  }

  const result = spawnSync(`${executionRuntime.toString()} ${args.join(" ")}`, childProcessOptions);
  // Bubble up process status
  process.exit(result.status ?? 1);
}

// No need for child process if we are using Node execution runtime, since we are already in Node.
// File MUST be imported at runtime, otherwise this won't work!!
import("./js-randomness-predictor.js").then(({ default: buildCli }) => buildCli().parse(args)).catch(() => process.exit(1));
