import { BuildEnvironmentOptions, defineConfig } from "vite";
import nodepath from "node:path";

type BuildTargets = "umd" | "cjs";
type BuildTargetsMap = Record<BuildTargets, boolean>;

const BUILD_TARGETS: BuildTargetsMap = { cjs: true, umd: true };
const BUILD_TARGET: BuildTargets | undefined = process.env.BUILD_TARGET as BuildTargets;

if (!BUILD_TARGET || BUILD_TARGET === undefined) {
  throw new Error(`[vite] process.env.BUILD_TARGET is not defined! Please use one of "${Object.keys(BUILD_TARGETS)}"`);
}
if (!BUILD_TARGETS[BUILD_TARGET]) {
  throw new Error(`[vite] Unknown build target in 'process.env.BUILD_TARGET'. Expected one of '${Object.keys(BUILD_TARGETS)}' got '${BUILD_TARGET}'`);
}

// Default to umd.
const BUILD: BuildEnvironmentOptions = {
  lib: {
    entry: nodepath.resolve(__dirname, "../src/browser/index.ts"),
    name: "JSRandomnessPredictor",
    formats: ["umd"],
    fileName: () => "js-randomness-predictor.js",
  },
  outDir: nodepath.resolve(__dirname, "../dist/umd"),
};

if (BUILD_TARGET === "cjs") {
  BUILD.lib = {
    ...BUILD.lib,
    entry: nodepath.resolve(__dirname, "../src/browser/index.ts"),
    formats: ["cjs"],
    fileName: () => "index.js",
  };
  BUILD.outDir = nodepath.resolve(__dirname, "../dist/browser");
}

export default defineConfig({
  resolve: {
    alias: {
      // Alias these so our browser shim works correctly.
      "z3-solver-jsrp": "./src/browser/shim.ts",
      "z3-solver-jsrp-low-level": "z3-solver-jsrp/dist/build/browser/low-level",
      "z3-solver-jsrp-high-level": "z3-solver-jsrp/dist/build/browser/high-level",
    },
  },
  build: {
    minify: true,
    ...BUILD,
  },
});
