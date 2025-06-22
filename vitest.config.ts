import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/predictors/**/*.ts"],
    },
  },
});
