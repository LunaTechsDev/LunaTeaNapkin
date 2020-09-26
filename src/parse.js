const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
import * as tt from '@babel/types';

import lunateaTransformer from './lunateaTransformer'
/**
 * Parses the code with prettier and applies specific transformation for the
 * output of plugins developed with LunaTea.
 *
 * @param {String} code The code to transform and prettify.
 * @param {Bool} usePretty Set to false to disable the use of pretty on the transformed code
 */
export default function parse(code, usePretty = true) {
  return prettier.format(code, {
    parser(text, { babel }) {
      const ast = babel(text);
      
      traverse(ast, {
        enter(path) {
          lunateaTransformer(ast, path)
        },
      });

      // Run generated code through prettier's default parser
      const codeTransformations = generate(ast, { retainLines: true }).code;

      if (usePretty === false) {
        return codeTransformations;
      }

      return prettier.format(codeTransformations, {
        endOfLine: "lf",
        parser: "babel",
      });
    },
  });
}
