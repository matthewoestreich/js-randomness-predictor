#!/usr/bin/env node

import { spawnSync, SpawnSyncOptionsWithBufferEncoding } from "node:child_process";
import nodepath from "node:path";
import { EXECUTION_RUNTIME_ENV_VAR_KEY } from "../constants.js";
import buildCli from "./lib.js";

const executionRuntime = process.env[EXECUTION_RUNTIME_ENV_VAR_KEY]?.trim() || "node";

// No need for child process if we are using Node execution runtime, since we are already in Node.
if (executionRuntime === "node") {
  buildCli().parse();
} else {
  /**
   * Need child process for runtimes other than Node.
   **/

  const argv = [nodepath.resolve(import.meta.dirname, "./lib.js"), ...process.argv.slice(2)];
  const childProcessOptions: SpawnSyncOptionsWithBufferEncoding = {
    stdio: "inherit",
    env: { ...process.env },
    shell: true, // Must be true for Windows...
  };

  // When spawning a non-Node runtime (e.g. deno/bun), this flag tells the CLI core
  // to behave like a "main" module and execute immediately instead of acting as a library.
  childProcessOptions.env!.JSRP_LIB_IS_MAIN = "1";

  if (executionRuntime === "deno") {
    // Deno needs an import map...smh
    const importMap = nodepath.resolve(import.meta.dirname, "./deno_import_map.json");
    // Deno forces us to put the "--allow-*" commands PRIOR to the script!
    // So the command ultimately becomes:`deno --node-modules-dir --allow-env --allow-read js-randomness-predictor.js <rest_of_cli_args>`
    argv.unshift("--node-modules-dir=auto", "--allow-env", "--allow-read", `--import-map=${importMap}`);
    // So we can use imports that arent prefixed with "npm:", eg `import x from "npm:x"`
    childProcessOptions.env!.DENO_COMPAT = "1";
  }

  const result = spawnSync(`${executionRuntime.toString()} ${argv.join(" ")}`, childProcessOptions);
  // Bubble up process status
  process.exit(result.status ?? 1);
}
