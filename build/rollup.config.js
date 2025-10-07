import nodepath from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { minify } from "rollup-plugin-esbuild-minify";
import { globSync } from "glob";

// For minifying built ts files

let __dirname__ = "";
if (typeof __dirname === "undefined") {
  __dirname__ = import.meta.dirname;
} else {
  __dirname__ = __dirname;
}

export default [
  /***************** Server-side CJS Build ******************/
  {
    input: nodepath.resolve(__dirname__, "../dist/staging/cjs/index.js"),
    output: {
      file: nodepath.resolve(__dirname__, "../dist/cjs/index.js"),
      format: "cjs",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /***************** Server-side ESM Build ******************/
  {
    input: nodepath.resolve(__dirname__, "../dist/staging/esm/index.js"),
    output: {
      file: nodepath.resolve(__dirname__, "../dist/esm/index.js"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
  /*********************** CLI Build ************************/
  {
    input: globSync(nodepath.resolve(__dirname__, "../dist/staging/cli/cli/**/*.js")),
    output: {
      dir: nodepath.resolve(__dirname__, "../dist/cli"),
      format: "esm",
    },
    plugins: [nodeResolve({ preferBuiltins: true }), minify()],
    external: (id) => !id.startsWith(".") && !nodepath.isAbsolute(id),
  },
];
