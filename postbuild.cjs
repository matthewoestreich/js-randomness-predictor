#!/usr/bin/env node
const { mkdirSync, writeFileSync, copyFileSync } = require("node:fs");
const { resolve } = require("node:path");

createPackageJsonIn_Dist_Cjs(resolve(__dirname, "./dist/cjs"));
//createPackageJsonIn_Dist_Umd(resolve(__dirname, "./dist/umd"));
createPackageJsonIn_Dist_Browser_Cjs(resolve(__dirname, "./dist/browser"));
createPackageJsonIn_Dist_Esm(resolve(__dirname, "./dist/esm"));
copyImportMapToBuild(resolve(__dirname, "./src/cli/deno_import_map.json"));

/**
 * For the cjs build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Cjs(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/cjs/] distPath required!");
  }
  try {
    mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = resolve(__dirname, distPath, "package.json");
    writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/cjs/] GOT ERROR : ${e.message}`);
  }
}

/**
 * For the umd build
 * @param {string} distPath : path to dist folder
 */
function createPackageJsonIn_Dist_Umd(distPath = "") {
  if (distPath === "") {
    throw new Error("[postbuild.js][create package.json in /dist/umd/] distPath required!");
  }
  try {
    mkdirSync(distPath, { recursive: true });
    const pkgJson = { types: "../types/umd/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = resolve(__dirname, distPath, "package.json");
    writeFileSync(outFile, pkgJsonString);
  } catch (e) {
    throw new Error(`[postbuild.js][create package.json in /dist/umd/] GOT ERROR : ${e.message}`);
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
    mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "module", types: "../types/index.d.ts" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = resolve(__dirname, distPath, "package.json");
    writeFileSync(outFile, pkgJsonString);
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
    mkdirSync(distPath, { recursive: true });
    const pkgJson = { type: "commonjs" };
    const pkgJsonString = JSON.stringify(pkgJson, null, 2);
    const outFile = resolve(__dirname, distPath, "package.json");
    writeFileSync(outFile, pkgJsonString);
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
    throw new Error("[postbuild.js][copy import map for CLI build (/dist/cli/)] need import map for deno");
  }
  try {
    const copyToPath = resolve(__dirname, "./dist/cli/deno_import_map.json");
    copyFileSync(importMapPath, copyToPath);
  } catch (e) {
    throw new Error(`[postbuild.js][copy import map for CLI build (/dist/cli/)] GOT ERROR : ${e.message}`);
  }
}
