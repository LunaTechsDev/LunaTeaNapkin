export default {
  input: "src/main.js",
  external: ["@babel/types", "yargs", "fs/promises", "path"],
  output: {
    banner: "#!/usr/bin/env node",
    file: "bin/napkin.js",
    format: "cjs",
  },
};
