const nodeFs = require("node:fs");
const nodePath = require("node:path");

createPackageJsonInCjsDist(nodePath.resolve(__dirname, "../dist/cjs"));

function createPackageJsonInCjsDist(distPath = "") {
  if (distPath === "") {
    throw new Error("distPath required!");
  }

  const outFile = nodePath.resolve(__dirname, distPath, "package.json");
  nodeFs.mkdirSync(distPath, { recursive: true });

  const pkgJson = JSON.stringify(
    {
      type: "commonjs",
    },
    null,
    2,
  );

  nodeFs.writeFileSync(outFile, pkgJson);
}
