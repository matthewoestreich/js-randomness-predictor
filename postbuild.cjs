#!/usr/bin/env node

const nodeFs = require("node:fs");
const nodePath = require("node:path");

createPackageJsonInCjsDist(nodePath.resolve(__dirname, "./dist/cjs"));

function createPackageJsonInCjsDist(distPath = "") {
  if (distPath === "") {
    throw new Error("distPath required!");
  }

  nodeFs.mkdirSync(distPath, { recursive: true });
  // prettier-ignore
  const pkgJson = JSON.stringify({ type: "commonjs" }, null, 2,);
  const outFile = nodePath.resolve(__dirname, distPath, "package.json");
  nodeFs.writeFileSync(outFile, pkgJson);
}
