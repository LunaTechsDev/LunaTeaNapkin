import * as tt from "@babel/types";

/**
 * Converts prototype literal assignments and declarations
 *
 * @param {Node} node The AST node from babels parser
 * @example
 * var alias = Class.prototype['methodName'] - > var alias = Class.prototype.methodName;
 *
 * Class.prototype['methodName'] = function (){} -> Class.prototype.methodName = function (){}
 */
export default function protoLiteralToObj(node) {
  if (isPrototypeLiteralAssignment(node)) {
    const { property, object } = node.left;
    const newLeft = literalToObject(node.left);
    node.left = newLeft;
  } else if (isPrototypeAliasLiteralDeclaration(node)) {
    const { init } = node.declarations[0];
    const newInit = literalToObject(init);
    node.declarations[0].init = newInit;
  }
}
