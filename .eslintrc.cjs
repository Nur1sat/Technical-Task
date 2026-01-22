module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  plugins: ["@typescript-eslint", "import"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always"
      }
    ]
  }
};

