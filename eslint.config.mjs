import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: "readonly",
        JSX: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Warn on unused variables (allow underscore-prefixed ones)
      // Disabled for now — ESLint core can't see JSX usage without a React plugin
      "no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        // Ignore variables used only in JSX (ESLint core doesn't parse JSX usage)
        caughtErrors: "none",
      }],
      // Prevent console.log in production (warn only — console.error/warn/info are allowed)
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      // Enforce === over ==
      "eqeqeq": ["error", "always"],
      // No var — use let/const
      "no-var": "error",
      // Prefer const when variable is never reassigned
      "prefer-const": "warn",
    },
  },
  {
    // Files where imports are used in JSX — suppress false-positive unused-vars
    files: ["app/layout.js", "app/**/page.jsx", "app/**/page.js"],
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    // Ignore build output and node_modules
    ignores: [".next/", "node_modules/", "out/"],
  },
];
