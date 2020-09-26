module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  globals: {
    module: true,
    require: true,
    process: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  rules: {},
};
