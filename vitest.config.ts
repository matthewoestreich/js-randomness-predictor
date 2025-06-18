import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.spec.ts"],
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["*", "!src/predictors/**"],
    },
  },
});
