import nodepath from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { minify } from "rollup-plugin-esbuild-minify";
import { globSync } from "glob";

// For minifying built ts files

export default [
  /***************** Server-side CJS Build ******************/
  {
    input: nodepath.resolve(import.meta.dirname, "../dist/staging/cjs/index.js"),
    output: {
      file: nodepath.resolve(import.meta.dirname, "../dist/cjs/index.js"),
      format: "cjs",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /***************** Server-side ESM Build ******************/
  {
    input: nodepath.resolve(import.meta.dirname, "../dist/staging/esm/index.js"),
    output: {
      file: nodepath.resolve(import.meta.dirname, "../dist/esm/index.js"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /*********************** CLI Build ************************/
  {
    input: globSync(nodepath.resolve(import.meta.dirname, "../dist/staging/cli/cli/**/*.js")),
    output: {
      dir: nodepath.resolve(import.meta.dirname, "../dist/cli"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
];
