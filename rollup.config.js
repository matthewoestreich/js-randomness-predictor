import nodepath from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { minify } from "rollup-plugin-esbuild-minify";
import { globSync } from "glob";

// For minifying built ts files

export default [
  /***************** CJS Build ******************/
  {
    input: "./dist-staging/cjs/index.js",
    output: {
      file: "./dist/cjs/index.js",
      format: "cjs",
      sourcemap: false,
    },
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /***************** ESM Build ******************/
  {
    input: "./dist-staging/esm/index.js",
    output: {
      file: "./dist/esm/index.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /***************** CLI Build ******************/
  {
    input: globSync("./dist-staging/cli/**/*.js"),
    output: {
      dir: "./dist/cli",
      format: "esm",
      sourcemap: false,
      //preserveModules: true,
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
];
