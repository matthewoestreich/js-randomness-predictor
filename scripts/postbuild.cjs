const nodeFs = require("node:fs");
const nodePath = require("node:path");

const outDir = nodePath.resolve(__dirname, "../dist/cjs");
const outFile = nodePath.resolve(__dirname, "../dist/cjs/package.json");

nodeFs.mkdirSync(outDir, { recursive: true });

const pkgJson = JSON.stringify(
  {
    type: "commonjs",
  },
  null,
  2,
);

nodeFs.writeFileSync(outFile, pkgJson);
