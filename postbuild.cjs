#!/usr/bin/env node

const nodeFs = require("node:fs");
const nodePath = require("node:path");

createPackageJsonInCjsDist(nodePath.resolve(__dirname, "./dist/cjs"));
createPackageJsonInUmdDist(nodePath.resolve(__dirname, "./dist/umd"));
copyImportMapToBuild(nodePath.resolve(__dirname, "./src/cli/deno_import_map.json"));

/**
 * For the cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonInCjsDist(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in CJS dist] distPath required!");
  }
  nodeFs.mkdirSync(distPath, { recursive: true });
  const pkgJson = { type: "commonjs", types: "../types/index.d.ts" };
  const pkgJsonString = JSON.stringify(pkgJson, null, 2);
  const outFile = nodePath.resolve(__dirname, distPath, "package.json");
  nodeFs.writeFileSync(outFile, pkgJsonString);
}

/**
 * For the umd build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonInUmdDist(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in UMD dist] distPath required!");
  }
  nodeFs.mkdirSync(distPath, { recursive: true });
  const pkgJson = { types: "../types/umd/index.d.ts" };
  const pkgJsonString = JSON.stringify(pkgJson, null, 2);
  const outFile = nodePath.resolve(__dirname, distPath, "package.json");
  nodeFs.writeFileSync(outFile, pkgJsonString);
}

/**
 * For the CLI build (Deno requires an import map)
 * @param {string} importMapPath : path to import map (.json).
 */
function copyImportMapToBuild(importMapPath = "") {
  if (importMapPath === "") {
    throw new Error("[postbuild.js][copy import map for CLI build] need import map for deno");
  }
  const copyToPath = nodePath.resolve(__dirname, "./dist/esm/cli/deno_import_map.json");
  nodeFs.copyFileSync(importMapPath, copyToPath);
}
