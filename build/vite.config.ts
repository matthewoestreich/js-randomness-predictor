import { BuildEnvironmentOptions, defineConfig, LibraryOptions } from "vite";
import nodepath from "node:path";

const BUILD_TARGETS = ["umd", "cjs"] as const;

// Create union type from const array
type BuildTarget = (typeof BUILD_TARGETS)[number];

/**
 * Creates build options based upon target
 * @param {BuildTarget} target - Target build type
 */
function createBuildOptions(target: BuildTarget): BuildEnvironmentOptions {
  const libOpts: LibraryOptions = {
    name: "JSRandomnessPredictor",
    entry: nodepath.resolve(__dirname, "../src/browser/index.ts"),
  };

  switch (target) {
    case "umd":
      return {
        minify: true,
        outDir: nodepath.resolve(__dirname, "../dist/umd"),
        lib: {
          ...libOpts,
          formats: ["umd"],
          fileName: () => "js-randomness-predictor.js",
        },
      };
    case "cjs":
      return {
        minify: true,
        outDir: nodepath.resolve(__dirname, "../dist/browser"),
        lib: {
          ...libOpts,
          formats: ["cjs"],
          fileName: () => "index.js",
        },
      };
    default:
      throw new Error(`[vite] Unknown build target in 'process.env.BUILD_TARGET'. Expected one of '${BUILD_TARGETS.join(", ")}' got '${target}'`);
  }
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
  build: createBuildOptions(process.env.BUILD_TARGET as BuildTarget),
});
