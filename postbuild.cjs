#!/usr/bin/env node
const nodefs = require("node:fs");
const nodepath = require("node:path");

createPackageJsonInCjsDist(nodepath.resolve(__dirname, "./dist/cjs"));
createPackageJsonInUmdDist(nodepath.resolve(__dirname, "./dist/umd"));
createPackageJsonInBrowserCjsDist(nodepath.resolve(__dirname, "./dist/browser"));
copyImportMapToBuild(nodepath.resolve(__dirname, "./src/cli/deno_import_map.json"));

/**
 * For the cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonInCjsDist(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in CJS dist] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in CJS dist] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the umd build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonInUmdDist(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in UMD dist] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { types: "../types/umd/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in UMD dist] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the browser/cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonInBrowserCjsDist(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in browser/cjs dist] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in browser/cjs dist] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the CLI build (Deno requires an import map)
 * @param {string} importMapPath : path to import map (.json).
 */
function copyImportMapToBuild(importMapPath = "") {
  if (importMapPath === "") {
    throw new Error("[postbuild.js][copy import map for CLI build] need import map for deno");
  }
  try {
    const copyToPath = nodepath.resolve(__dirname, "./dist/esm/cli/deno_import_map.json");
    nodefs.copyFileSync(importMapPath, copyToPath);
  } catch (e) {
    throw new Error(`[postbuild.js][copy import map for CLI build] GOT ERROR : ${e.message}`);
  }
}
