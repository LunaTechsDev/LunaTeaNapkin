import parse from "./parse";

import { argv } from "yargs";
import fs from "fs.promises";
import path from "path";
import addCleanupEvent from './cleanup';

const TARGET_DIR = argv.path ? path.resolve(argv.path) : path.resolve("dist");
const usePretty = argv.pretty === undefined ? true : argv.pretty;
const isPaper = argv.paper === undefined ? true : argv.paper;
const unusedClasses =
  argv.unusedClasses === undefined ? true : argv.unusedClasses;
const pluginName = argv.name;

  console.log(pluginName);
  const buildComment = (filename) => {
    const title = isPaper ? 'OrigamiPlugins' : filename;
    const madeWith = isPaper ? `Made with PaperTea -- Haxe` : `Made with LunaTea -- Haxe`
  return `/** ============================================================================
 *
 *  ${pluginName || title}
 * 
 *  Build Date: ${new Date().toLocaleDateString("en-US")}
 * 
 *  ${madeWith}
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
    paths.forEach(async (filepath) => {
      if (path.extname(filepath) !== '.js' || /[temp]*\d{4,99}/.test(filepath)) {
        return;
      }
        const data = await fs.readFile(`${TARGET_DIR}/${filepath}`, {
        encoding: "utf8",
      });

      const result = await parse(data, {
        usePrettier: usePretty,
        removeUnusedClasses: unusedClasses,
        isPaper
      });

      await fs.writeFile(`${TARGET_DIR}/${filepath}`, buildComment(filepath) + result, {
        encoding: "utf8",
      });
    });
    addCleanupEvent(async () => {
      const paths = await fs.readdir(TARGET_DIR);
      paths.forEach(async filepath => {
        if (/[temp]*\d{4,99}/.test(filepath)) {
          await fs.unlink(filepath);
        }
      })
    })
  })().catch((error) => {
    process.exitCode = 1;
    console.error(error);
  });
}

export { parse };
