import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintUnusedImport from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.ts", "eslint.config.js"],
    ignores: ["dist/"],
    plugins: {
      "simple-import-sort": eslintSimpleImportSort,
      "unused-imports": eslintUnusedImport,
    },
    rules: {
      "comma-dangle": ["error", "always-multiline"],
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      "max-len": [
        "error",
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "security/detect-object-injection": "off",
      "simple-import-sort/imports": [
        "error",
        { groups: [["^.*\\u0000$", "^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
      ],
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
];
