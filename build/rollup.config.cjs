const nodepath = require("node:path");
const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { minify } = require("rollup-plugin-esbuild-minify");
const { globSync } = require("glob");

// For minifying built ts files

module.exports = [
  /***************** Server-side CJS Build ******************/
  {
    input: nodepath.resolve(__dirname, "../dist/staging/cjs/index.js"),
    output: {
      file: nodepath.resolve(__dirname, "../dist/cjs/index.js"),
      format: "cjs",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /***************** Server-side ESM Build ******************/
  {
    input: nodepath.resolve(__dirname, "../dist/staging/esm/index.js"),
    output: {
      file: nodepath.resolve(__dirname, "../dist/esm/index.js"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /*********************** CLI Build ************************/
  {
    input: globSync(nodepath.resolve(__dirname, "../dist/staging/cli/cli/**/*.js")),
    output: {
      dir: nodepath.resolve(__dirname, "../dist/cli"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
];
