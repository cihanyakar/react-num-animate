import stylistic from "@stylistic/eslint-plugin";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import checkFile from "eslint-plugin-check-file";
import complexityPlugin from "eslint-plugin-complexity";
import { importX } from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Global ignores
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/build",
      "**/storybook-static",
      "**/*.d.ts",
      "**/eslint.config.*",
      "**/vite.config.*",
      "**/tsup.config.*"
    ]
  },
  // TypeScript parser + project config (lib)
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        })
      ],
      react: { version: "detect" }
    }
  },
  // TypeScript parser + project config (storybook workspace)
  {
    files: ["examples/storybook/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./examples/storybook/tsconfig.json",
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: "./examples/storybook/tsconfig.json"
        })
      ],
      react: { version: "detect" }
    }
  },
  // Base plugins
  {
    plugins: {
      "@stylistic": stylistic,
      "@typescript-eslint": tsEslintPlugin,
      "check-file": checkFile,
      complexity: complexityPlugin,
      "import-x": importX,
      react: react,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefresh
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    }
  },
  // TypeScript specific rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/unified-signatures": "error",
      "@typescript-eslint/prefer-find": "error",
      "@typescript-eslint/no-meaningless-void-operator": "error",
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/no-misused-spread": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-mixed-enums": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-duplicate-enum-values": "error"
    }
  },
  // Common style rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Bracing and spacing
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      curly: ["error", "all"],
      "@stylistic/object-curly-newline": ["error", { multiline: true, consistent: true }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/space-before-function-paren": ["error", "never"],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/space-infix-ops": "error",

      // Punctuation
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],

      // Indentation and line spacing
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] }
      ],

      // File naming conventions
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{tsx,jsx}": "PASCAL_CASE", "**/*.{ts,js,mjs,cjs}": "CAMEL_CASE" },
        { ignoreMiddleExtensions: true }
      ],
      "check-file/folder-naming-convention": ["error", { "**/": "KEBAB_CASE" }],

      // Import rules
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "ignore",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],
      "import-x/no-duplicates": "error",
      "import-x/no-unused-modules": "error",
      "import-x/no-unresolved": "error",

      // Code complexity limits
      complexity: ["error", { max: 15 }],
      "max-lines-per-function": ["error", { max: 140, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", { max: 4 }],
      "max-params": ["error", { max: 5 }],
      "func-style": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message: "for..in loops iterate over the entire prototype chain. Use Object.{keys,values,entries} and iterate over the resulting array instead."
        }
      ]
    }
  },
  // JSX and React rules
  {
    files: ["**/*.{tsx,jsx}"],
    rules: {
      // JSX Style
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/jsx-closing-bracket-location": ["error", "line-aligned"],
      "@stylistic/jsx-closing-tag-location": "error",
      "@stylistic/jsx-curly-spacing": ["error", { when: "never", children: true }],
      "@stylistic/jsx-equals-spacing": ["error", "never"],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-indent-props": ["error", 2],
      "@stylistic/jsx-max-props-per-line": ["error", { maximum: 1, when: "multiline" }],
      "@stylistic/jsx-tag-spacing": [
        "error",
        {
          closingSlash: "never",
          beforeSelfClosing: "always",
          afterOpening: "never",
          beforeClosing: "never"
        }
      ],

      // React
      "react/function-component-definition": ["error", { namedComponents: "function-declaration" }],
      "react/boolean-prop-naming": ["error", { propTypeNames: ["bool", "mutuallyExclusiveTrueProps"] }],
      "react/jsx-handler-names": ["error", { checkInlineFunction: false }],
      "react/jsx-pascal-case": "error",
      "react/jsx-props-no-multi-spaces": "error",
      "react/jsx-props-no-spread-multi": "error",
      "react/no-array-index-key": "error",
      "react/no-children-prop": "error",
      "react/no-find-dom-node": "error",
      "react/no-unescaped-entities": "error",
      "react/self-closing-comp": "error",
      "react/style-prop-object": "error",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error"
    }
  },
  // Disable filename convention for standard entry/barrel files
  {
    files: ["**/main.tsx", "**/index.tsx", "**/index.ts"],
    rules: {
      "check-file/filename-naming-convention": "off"
    }
  },
  // Storybook config folder is conventionally named .storybook
  {
    files: ["**/.storybook/**/*"],
    rules: {
      "check-file/folder-naming-convention": "off"
    }
  }
];
