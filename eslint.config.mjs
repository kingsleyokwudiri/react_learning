// ESLint "flat config" (the format used by ESLint v9 and later).
// This file is .mjs so Node treats it as an ES module, without needing
// "type": "module" in package.json -- which would change how Node reads
// the plain .js files in no-build/libs/.
//
// Run it with:  npm run lint        (or)  npm run lint:fix

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // 1. Never lint third-party code or installed packages.
  //    no-build/libs/ holds the vendored copies of React, Babel and friends
  //    that the browser loads via <script> tags. They are not ours to fix.
  //    tictactoe-app/ and chatbot-app/ are separate Vite projects with their
  //    own eslint.config.js files and rule sets; lint those from inside their
  //    folders instead.
  {
    ignores: ["**/libs/**", "node_modules/**", "tictactoe-app/**", "chatbot-app/**"],
  },

  // 2. ESLint's own recommended rules (unused variables, undefined names,
  //    accidental globals, unreachable code, ...).
  js.configs.recommended,

  // 3. Rules for our JSX files.
  {
    files: ["**/*.jsx"],

    plugins: {
      "react-hooks": reactHooks,
    },

    languageOptions: {
      ecmaVersion: "latest",
      // "module" lets files use import/export. chatbot/app.jsx does.
      sourceType: "module",

      parserOptions: {
        // Teaches the parser that <Box /> is JSX, not a comparison operator.
        ecmaFeatures: { jsx: true },
      },

      // Names that exist without being declared in the file.
      globals: {
        ...globals.browser, // document, window, setInterval, crypto, ...
        // Loaded as globals by the <script> tags in the .html files.
        React: "readonly",
        ReactDOM: "readonly",
        Chatbot: "readonly",
        dayjs: "readonly",
      },
    },

    rules: {
      // Hooks must not be called conditionally, in loops, or nested inside
      // other functions. This is the rule that keeps React working.
      "react-hooks/rules-of-hooks": "error",
      // Warns when a useEffect reads a value it forgot to list as a dependency.
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
