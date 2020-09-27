import * as babelTraverse from "@babel/traverse";
import * as babelGenerator from "@babel/generator";
import * as tt from "@babel/types";
import prettier from "prettier";
import { referenceTracker, classRefTracker } from "./referenceTracker";

import lunateaTransformer from "./lunateaTransformer";

const traverse = babelTraverse.default;
const generate = babelGenerator.default;
const defaultParseOptions = {
  usePrettier: true,
  removeUnusedClasses: true,
};
/**
 * Parses the code with prettier and applies specific transformation for the
 * output of plugins developed with LunaTea.
 *
 * @param {String} code The code to transform and prettify.
 * @param {Bool} usePretty Set to false to disable the use of pretty on the transformed code
 */
export default function parse(code, options = defaultParseOptions) {
  const { usePrettier, removeUnusedClasses } = {
    ...defaultParseOptions,
    ...options,
  };
  return prettier.format(code, {
    parser(text, { babel }) {
      const ast = babel(text);

      traverse(ast, {
        enter(path) {
          referenceTracker(path);
          lunateaTransformer(ast, path);
        },
      });

      if (removeUnusedClasses) {
        const refs = classRefTracker.getReferences();
        /* eslint-disable no-unused-vars */
        for (let [key, value] of refs) {
          if (
            value.count <= 1 &&
            value.path &&
            tt.isClassDeclaration(value.path.node)
          ) {
            value.path.remove();
          }
        }
      }

      const codeTransformations = generate(ast, {
        retainLines: true,
      }).code;

      if (usePrettier === false) {
        return codeTransformations;
      }

      return prettier.format(codeTransformations, {
        endOfLine: "lf",
        parser: "babel",
      });
    },
  });
}
