import parse from "./parse";

import { argv } from "yargs";
import fs from "fs.promises";
import path from "path";

const TARGET_DIR = argv.path ? path.resolve(argv.path) : path.resolve("dist");
const usePretty = argv.pretty === undefined ? true : argv.pretty;
const unusedClasses = argv.unusedClasses === undefined ? true : argv.unusedClasses;

const buildComment = (filename) => {
  return `/** ============================================================================
 *
 *  ${filename}
 * 
 *  Build Date: ${new Date().toLocaleDateString("en-US")}
 * 
 *  Made with LunaTea -- Haxe
 *
 * =============================================================================
*/
`;
};

if (require.main === module) {
  /**
   * The CLI program
   */
  (async function main() {
    const paths = await fs.readdir(TARGET_DIR);
    paths.forEach(async (path) => {
      const data = await fs.readFile(`${TARGET_DIR}/${path}`, {
        encoding: "utf8",
      });

      const result = parse(data, {
        usePrettier: usePretty,
        removeUnusedClasses: unusedClasses
      });

      await fs.writeFile(`${TARGET_DIR}/${path}`, buildComment(path) + result, {
        encoding: "utf8",
      });
    });
  })().catch((error) => {
    process.exitCode = 1;
    console.error(error);
  });
}

export {
  parse
}
