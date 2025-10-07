#!/usr/bin/env node

/**
 * - Instead of having an npm command that is 4,000 characters long, just run this script.
 * - Assume your build command is being called relative to project root.
 * - Expects an array of object with the following shape:
 *    { "command": "command you want to run", "description": "what does cmd do?" }
 */

import nodepath from "node:path";
import nodefs from "node:fs";
import { execSync } from "node:child_process";

const commands = parseArgIntoJson();

let command = "";

for (let i = 0; i < commands.length; i++) {
  const c = commands[i];
  logFoundCommand(c.command, c.description);
  command += c.command;
  if (i < commands.length - 1) {
    command += " && ";
  }
}

try {
  logFullCommand(command);
  execSync(command, { stdio: "inherit" });
  logSuccess();
  process.exit(0);
} catch (e) {
  console.log(red(`Something went wrong!`, e.message));
  process.exit(1);
}

/************************** Helper functions ****************************/

function logFoundCommand(command, description) {
  console.log(green("Found command:"));
  console.log("\tCommand\t\t", blue(command), "\n\tDescription\t", cyan(description ?? "-"), "\n");
}

function logFullCommand(fullCommand) {
  console.log(hashtags(75));
  console.log(cyan("Full command:"));
  console.log(
    magenta(
      fullCommand
        .split("&&")
        .map((e) => `\t${e}`)
        .join("&& \\\n")
        .trimEnd("&& \\n"),
    ),
  );
  console.log(hashtags(75));
}

// Parses the provided argument (supposed to be a json file)
// Reads file, returns parsed json
function parseArgIntoJson() {
  const argv = process.argv.slice(2);
  const argc = argv.length;
  if (argc !== 1) {
    throw new Error(`Expected one arg! Got ${argc}\n Usage:\n${__filename} /some/json/file.json`);
  }
  const relativePath = argv[0];
  if (!relativePath.endsWith(".json")) {
    throw new Error(`Expected json file path! Got ${relativePath}\n Usage:\n${__filename} /some/json/file.json`);
  }
  const absolutePath = nodepath.resolve(import.meta.dirname, relativePath);
  if (!nodefs.existsSync(absolutePath)) {
    throw new Error(`JSON file does not exist at path! Got ${absolutePath}\n Usage:\n${__filename} /some/json/file.json`);
  }
  return JSON.parse(nodefs.readFileSync(absolutePath, "utf-8"));
}

function logSuccess() {
  console.log(`\n\n${blue(hashtags(75))}` + green("\n\tSuccess! All commands ran without error!\n") + `${blue(hashtags(75))}\n\n`);
}

function hashtags(n = 10) {
  return "#".repeat(n);
}

function red(...text) {
  return `\x1b[31m${text.join(" ")}\x1b[0m`;
}

function green(...text) {
  return `\x1b[32m${text.join(" ")}\x1b[0m`;
}

function yellow(...text) {
  return `\x1b[33m${text.join(" ")}\x1b[0m`;
}

function blue(...text) {
  return `\x1b[94m${text.join(" ")}\x1b[0m`;
}

function magenta(...text) {
  return `\x1b[35m${text.join(" ")}\x1b[0m`;
}

function cyan(...text) {
  return `\x1b[36m${text.join(" ")}\x1b[0m`;
}
