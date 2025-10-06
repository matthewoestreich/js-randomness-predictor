#!/usr/bin/env node
const nodefs = require("node:fs");
const nodepath = require("node:path");

createPackageJsonIn_Dist_Cjs(nodepath.resolve(__dirname, "./dist/cjs"));
createPackageJsonIn_Dist_Browser(nodepath.resolve(__dirname, "./dist/umd"));
createPackageJsonIn_Dist_Browser_Cjs(nodepath.resolve(__dirname, "./dist/browser"));
createPackageJsonIn_Dist_Esm(nodepath.resolve(__dirname, "./dist/esm"));
copyImportMapToBuild(nodepath.resolve(__dirname, "./src/cli/deno_import_map.json"));

/**
 * For the cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Cjs(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/cjs/] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/cjs/] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the browser build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Browser(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/browser/] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { types: "../types/browser/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/browser/] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the esm build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Esm(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/esm/] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "module", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/esm/] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the browser/cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Browser_Cjs(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/browser/cjs/] distPath required!");
  }
  try {
    nodefs.mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = nodepath.resolve(__dirname, distPath, "package.json");
    nodefs.writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/browser/cjs/] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the CLI build (Deno requires an import map)
 * @param {string} importMapPath : path to import map (.json).
 */
function copyImportMapToBuild(importMapPath = "") {
  if (importMapPath === "") {
    throw new Error("[postbuild.js][copy import map for CLI build (/dist/esm/cli/)] need import map for deno");
  }
  try {
    const copyToPath = nodepath.resolve(__dirname, "./dist/esm/cli/deno_import_map.json");
    nodefs.copyFileSync(importMapPath, copyToPath);
  } catch (e) {
    throw new Error(`[postbuild.js][copy import map for CLI build (/dist/esm/cli/)] GOT ERROR : ${e.message}`);
  }
}
