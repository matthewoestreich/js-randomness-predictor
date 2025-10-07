#!/usr/bin/env node

/**
 *  Instead of having an npm command that is 4,000 characters long, just run this script.
 *  Assume your build command is being called relative to project root.
 */

import { execSync } from "node:child_process";

// NPM scripts
const commands = [
  {
    command: "npm run clean:build",
    description: "Cleans existing build dir",
  },
  {
    command: "npm run build:esm",
    description: "Builds server side ESM module",
  },
  {
    command: "npm run build:cli",
    description: "Builds CLI",
  },
  {
    command: "npm run build:cjs",
    description: "Builds server side CJS module",
  },
  {
    command: "npm run build:umd",
    description: "Builds browser UMD (for use in <script> tags)",
  },
  {
    command: "npm run build:browser:cjs",
    description: "Buids CJS for for browser frameworks (React, Vue, Svelte, etc..)",
  },
  {
    command: "npm run emit:types",
    description: "Emits types (.d.ts files)",
  },
  {
    command: "npm run minify",
    description: "Minifies built server-side modules (essentially minifies tsc output)",
  },
  {
    command: "npm run clean:build:staging",
    description: "Cleans our staging folder, which is where tsc outputs files so we can then minify them into their final destination.",
  },
];

let command = "";

for (let i = 0; i < commands.length; i++) {
  const c = commands[i];
  logFoundBuildCommand(c.command, c.description);
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

function logFoundBuildCommand(command, description) {
  console.log(green("Found build command:"));
  console.log("\tCommand\t\t", blue(command), "\n\tDescription\t", cyan(description ?? "-"), "\n");
}

function logFullCommand(fullCommand) {
  console.log(hashtags(75));
  console.log(cyan("Full build command:"));
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

function logSuccess() {
  console.log(`\n\n${blue(hashtags(75))}` + green("\n\tSuccess! All builds ran without error!\n") + `${blue(hashtags(75))}\n\n`);
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
