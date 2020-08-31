#!/usr/bin/env node
const prettier = require("prettier");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const tt = require("@babel/types");
const { argv } = require("yargs");
const fs = require("fs").promises;

const isDev = process.env.NODE_ENV !== "production";

const TARGET_DIR = isDev ? "dist" : argv.path;

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
    if (!TARGET_DIR || TARGET_DIR === "") {
      console.error("You must provide a path");
      process.exitCode = 1;
    }
    const paths = await fs.readdir(TARGET_DIR);
    paths.forEach(async (path) => {
      const data = await fs.readFile(`${TARGET_DIR}/${path}`, {
        encoding: "utf8",
      });

      const result = parse(data);

      await fs.writeFile(`${TARGET_DIR}/${path}`, buildComment(path) + result, {
        encoding: "utf8",
      });
    });
  })().catch((error) => {
    process.exitCode = 1;
    console.error(error);
  });
}

/**
 * Parses the code with prettier and applies specific transformation for the
 * output of plugins developed with LunaTea.
 *
 * @param {code} code The code to transform and prettify.
 */
function parse(code) {
  return prettier.format(code, {
    parser(text, { babel }) {
      const ast = babel(text);
      cleanComments(ast.comments);

      traverse(ast, {
        enter(path) {
          removeEmptyClasses(path);
          removeUnwantedIdentifier(path);
          convertPrototypeLiteralsToObject(path.node);
        },
      });

      // Run generated code through prettier's default parser for even cleaner code
      const codeTransformations = generate(ast, { retainLines: true }).code;
      return prettier.format(codeTransformations, {
        endOfLine: "lf",
        parser: "babel",
      });
    },
  });
}

function cleanComments(comments) {
  const lineComments = comments.filter((c) => c.type === "CommentLine");
  lineComments.forEach((comment) => {
    if (comment.value.includes("@")) {
      comment.value = comment.value.replace(/"@|@"/g, "");
    }
  });
}

function removeUnwantedIdentifier(path) {
  const { node } = path;
  if (tt.isVariableDeclaration(node)) {
    if (isVariableWithMemberExpression(node)) {
      const { init } = node.declarations[0];
      const { object } = init.object;
      const newExpression = nestedToPropertyExpression(object);
      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.object = newExpression;
      }
    }
  }
}

function isVariableWithMemberExpression(node) {
  const { declarations } = node;
  if (declarations) {
    const { init } = declarations[0];

    return (
      init && tt.isMemberExpression(init) && tt.isMemberExpression(init.object)
    );
  }
  return false;
}

function nestedToPropertyExpression(object) {
  if (object.object && object.object.name === "_$LTGlobals_$") {
    const { property, object } = init;
    const newObject = tt.identifier(object.object.property.name);
    const newExpression = tt.memberExpression(
      newObject,
      object.property,
      false
    );
    return newExpression;
  }
}

/**
 * Converts prototype literal assignments and declarations
 *
 * @param {Node} node The AST node from babels parser
 * @example
 * var alias = Class.prototype['methodName'] - > var alias = Class.prototype.methodName;
 *
 * Class.prototype['methodName'] = function (){} -> Class.prototype.methodName = function (){}
 */
function convertPrototypeLiteralsToObject(node) {
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

/**
 * Checks if there is a variable declaration for a class prototype using bracket
 * notation.
 *
 * @param {Node} node The AST node from babels parser
 *
 * @example var alias = Class.prototype['methodName']
 */
function isPrototypeAliasLiteralDeclaration(node) {
  if (tt.isVariableDeclaration(node)) {
    const declaration = node.declarations[0];
    if (
      tt.isMemberExpression(declaration.init) &&
      tt.isLiteral(declaration.init.property)
    ) {
      const { property } = declaration.init.object;
      return property && property.name === "prototype";
    }
  }
  return false;
}

/**
 * Checks if there is an assignment expression for a class prototype using
 * bracket notation.
 *
 * @param {Node} node The AST node from babels parser
 *
 * @example Class.prototype['methodName']
 */
function isPrototypeLiteralAssignment(node) {
  if (tt.isAssignmentExpression(node) && tt.isLiteral(node.left.property)) {
    const { property, object } = node.left;
    if (object.property) {
      return object.property.name === "prototype";
    }
    return false;
  }
  return false;
}

function removeEmptyClasses(path, onRemove) {
  const { node } = path;
  if (tt.isClassDeclaration(node)) {
    if (node.body.body.length <= 0) {
      if (typeof onRemove === "function") {
        onRemove(node.id);
      }
      path.remove();
    }
  }
}

/**
 * Converts a member expression from bracket notation to object notation and
 * returns a new MemberExpression with the changes.
 *
 * @param {Node} leftNode - The left expression in the node
 * @return {MemberExpression} MemberExpression
 *
 * @example Class.prototype['methodName'] -> Class.prototype.methodName
 */
function literalToObject(leftNode) {
  const { property, object } = leftNode;
  const newProperty = tt.identifier(property.value);
  const newAssignment = tt.memberExpression(object, newProperty, false);
  return newAssignment;
}

module.exports = { parse };
