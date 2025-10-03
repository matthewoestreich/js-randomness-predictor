import { defineConfig } from "vite";
import nodepath from "node:path";

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
    lib: {
      entry: nodepath.resolve(__dirname, "../src/browser/es.ts"),
      name: "JSRandomnessPredictor",
      formats: ["es"],
      fileName: () => "index.js",
    },
    minify: true,
    outDir: nodepath.resolve(__dirname, "../dist/es"),
    emptyOutDir: true,
  },
});
