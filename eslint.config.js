import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// Sanitize global names to remove whitespace
const sanitizedGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([k, v]) => [k.trim(), v])
);

export default [
  js.configs.recommended,
  {
    ignores: ["dist"],
  },
  {
    files: ["**/*.{ts,tsx}", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: sanitizedGlobals,
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
