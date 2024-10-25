import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import airbnbBase from "eslint-config-airbnb-base";
import pluginJest from "eslint-plugin-jest";
import pluginSecurity from "eslint-plugin-security";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import parserTs from "@typescript-eslint/parser";


export default [
  {
    languageOptions: {
      parser: parserTs,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["node_modules", "eslint.config.mjs"],

    plugins: {
      jest: pluginJest,
      security: pluginSecurity,
      prettier: pluginPrettier,
    },

    rules: {
      ...airbnbBase.rules,
      ...configPrettier.rules,
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-unused-expressions": ["error"],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "prettier/prettier": ["error"],
      "no-console": ["error"],
      "prefer-const": ["error"],
      "quotes": ["error", "double"],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginSecurity.configs.recommended,
];