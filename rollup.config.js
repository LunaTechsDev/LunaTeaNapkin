import babel from '@rollup/plugin-babel';

export default {
  input: "src/main.js",
  external: [
    "@babel/types",
    "yargs",
    "fs/promises",
    "path",
    "@babel/traverse",
    "@babel/generator",
    "prettier",
    "fs.promises",
    "temp",
    "typescript"
  ],
  output: {
    banner: "#!/usr/bin/env node",
    file: "bin/napkin.js",
    format: "cjs",
  },
  plugins: [
    babel({
      babelHelpers: "bundled",
    }),
  ],
};
