import { defineConfig } from "vite";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        //{
        //  src: "node_modules/z3-solver/build/z3-built*",
        //  dest: "", // Relative to `build.outDir`.
        //},
        {
          src: "src/browser/coi/coi.serviceworker.js",
          dest: "", // Relative to `build.outDir`.
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/browser/index.ts"),
      name: "JSRandomnessPredictor",
      formats: ["umd"],
      fileName: () => "js-randomness-predictor.js",
    },
    outDir: "dist/umd",
    emptyOutDir: true,
  },
});
