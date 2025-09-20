import { createRequire } from "module";
import { Linter } from "eslint";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const require = createRequire(import.meta.url);

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: [
      "**/*.*config.*",
      "__tests__/**",
      "**/*.test.*",
      "dist/**/*",
      "coverage/**",
      ".husky/**",
      ".vscode/**",
      ".git/**",
      ".github/**",
      "www/**",
      "www-pub/**",
      "cypress/**",
      "node_modules/**",
      "scripts/**",
      "tests/scripts/**",
      "tests/browser/coi.serviceworker.js",
      "postbuild.cjs",
      "src/browser/coi/**/*",
      "cdn/**/*",
      "tests/browser/z3-built.*",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.base.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-async-promise-executor": "off",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": false,
          "ts-nocheck": false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
        },
      ],
    },
  },
] as Linter.Config[];
