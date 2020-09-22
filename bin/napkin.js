#!/usr/bin/env node
"use strict";

const prettier = require("prettier");

const traverse = require("@babel/traverse").default;

const generate = require("@babel/generator").default;

const tt = require("@babel/types");

const {
  argv
} = require("yargs");

const fs = require("fs").promises;

const path = require('path');

const TARGET_DIR = argv.path ? path.resolve(argv.path) : path.resolve('dist');
const usePretty = argv.pretty === undefined ? true : argv.pretty;

const buildComment = filename => {
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
    paths.forEach(async path => {
      const data = await fs.readFile(`${TARGET_DIR}/${path}`, {
        encoding: "utf8"
      });
      const result = parse(data, usePretty);
      await fs.writeFile(`${TARGET_DIR}/${path}`, buildComment(path) + result, {
        encoding: "utf8"
      });
    });
  })().catch(error => {
    process.exitCode = 1;
    console.error(error);
  });
}
/**
 * Parses the code with prettier and applies specific transformation for the
 * output of plugins developed with LunaTea.
 *
 * @param {String} code The code to transform and prettify.
 * @param {Bool} usePretty Set to false to disable the use of pretty on the transformed code
 */


function parse(code, usePretty = true) {
  return prettier.format(code, {
    parser(text, {
      babel
    }) {
      const ast = babel(text);
      cleanComments(ast.comments);
      traverse(ast, {
        enter(path) {
          removeEmptyClasses(path);
          removeUnwantedIdentifier(path);
          convertPrototypeLiteralsToObject(path.node);
        }

      }); // Run generated code through prettier's default parser for even cleaner code

      const codeTransformations = generate(ast, {
        retainLines: true
      }).code;

      if (usePretty === false) {
        return codeTransformations;
      }

      return prettier.format(codeTransformations, {
        endOfLine: "lf",
        parser: "babel"
      });
    }

  });
}

function cleanComments(comments) {
  const lineComments = comments.filter(c => c.type === "CommentLine");
  lineComments.forEach(comment => {
    if (comment.value.includes("@")) {
      comment.value = comment.value.replace(/"@|@"/g, "");
    }
  });
}

function removeUnwantedIdentifier(path) {
  const {
    node
  } = path;

  if (tt.isVariableDeclaration(node)) {
    if (isVariableWithMemberExpression(node)) {
      const {
        init
      } = node.declarations[0];
      const newExpression = nestedToPropertyExpression(init);

      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.object = newExpression;
      }
    } else if (isVariableWithCallExpression(node)) {
      const {
        init
      } = node.declarations[0];
      const newExpression = nestedToCallExpression(init.callee);

      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.callee = newExpression;
      }
    } else if (isVariableWithMemberIdentifier(node)) {
      const declaration = node.declarations[0];
      const iss = isVariableWithMemberIdentifier(node);
      const newExpression = memberExpressionToExpression(declaration);

      if (newExpression) {
        node.declarations.splice(0, 1, newExpression);
      }
    }
  }

  if (tt.isCallExpression(node)) {
    convertCallExpressionArguments(node);
    const {
      callee
    } = node;

    if (tt.isMemberExpression(callee === null || callee === void 0 ? void 0 : callee.object)) {
      var _object$object;

      const {
        object
      } = callee;

      if ((object === null || object === void 0 ? void 0 : (_object$object = object.object) === null || _object$object === void 0 ? void 0 : _object$object.name) === "_$LTGlobals_$") {
        const newExpression = nestedToCallExpression(callee);
        node.callee = newExpression;
      }
    }
  }
}

function convertCallExpressionArguments(node) {
  for (const [index, arg] of node.arguments.entries()) {
    if (tt.isCallExpression(arg)) {
      var _node$callee, _node$callee$object;

      // perform call expression transform
      if (((_node$callee = node.callee) === null || _node$callee === void 0 ? void 0 : (_node$callee$object = _node$callee.object) === null || _node$callee$object === void 0 ? void 0 : _node$callee$object.name) === "_$LTGlobals_$") {
        const newCallExpression = nestedToCallExpression(arg.callee);
        node.arguments[index] = newCallExpression;
      }
    } else if (tt.isMemberExpression(arg.object)) {
      if (arg.object.object.name === "_$LTGlobals_$") {
        const newObject = tt.identifier(arg.object.property.name);
        const newExpression = tt.memberExpression(newObject, arg.property, false);
        node.arguments[index] = newExpression;
      }
    } else if (tt.isIdentifier(arg.object)) {
      if (arg.object.name === "_$LTGlobals_$") {
        node.arguments[index] = tt.identifier(arg.property.name);
      }
    }
  }
}

function isVariableWithMemberIdentifier(node) {
  const {
    declarations
  } = node;

  if (declarations) {
    const {
      init
    } = declarations[0];
    return init && tt.isMemberExpression(init) && tt.isIdentifier(init.object) && tt.isIdentifier(init.property);
  }

  return false;
}

function isVariableWithMemberExpression(node) {
  const {
    declarations
  } = node;

  if (declarations) {
    const {
      init
    } = declarations[0];
    return init && tt.isMemberExpression(init) && tt.isMemberExpression(init.object);
  }

  return false;
}

function memberExpressionToExpression(declaration) {
  const {
    id,
    init
  } = declaration;

  if (init && init.object && init.object.name === "_$LTGlobals_$") {
    const {
      property,
      object
    } = init;
    const newExpression = tt.variableDeclarator(tt.identifier(id.name), tt.identifier(property.name));
    return newExpression;
  }
}

function nestedToCallExpression(callee) {
  var _callee$object, _callee$object$object;

  if ((callee === null || callee === void 0 ? void 0 : (_callee$object = callee.object) === null || _callee$object === void 0 ? void 0 : (_callee$object$object = _callee$object.object) === null || _callee$object$object === void 0 ? void 0 : _callee$object$object.name) === "_$LTGlobals_$") {
    const newObject = tt.identifier(callee.object.property.name);
    const newExpression = tt.memberExpression(newObject, callee.property, false);
    return newExpression;
  }
}

function nestedToPropertyExpression(init) {
  const {
    object
  } = init.object;

  if (object.object && object.object.name === "_$LTGlobals_$") {
    const {
      property,
      object
    } = init;
    const newObject = tt.identifier(object.object.property.name);
    const newExpression = tt.memberExpression(newObject, object.property, false);
    return newExpression;
  }
}

function isVariableWithCallExpression(node) {
  const {
    declarations
  } = node;

  if (declarations) {
    const {
      init
    } = declarations[0];
    return init && tt.isCallExpression(init);
  }

  return false;
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
    const {
      property,
      object
    } = node.left;
    const newLeft = literalToObject(node.left);
    node.left = newLeft;
  } else if (isPrototypeAliasLiteralDeclaration(node)) {
    const {
      init
    } = node.declarations[0];
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

    if (tt.isMemberExpression(declaration.init) && tt.isLiteral(declaration.init.property)) {
      const {
        property
      } = declaration.init.object;
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
    const {
      property,
      object
    } = node.left;

    if (object.property) {
      return object.property.name === "prototype";
    }

    return false;
  }

  return false;
}

function removeEmptyClasses(path, onRemove) {
  const {
    node
  } = path;

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
  const {
    property,
    object
  } = leftNode;
  const newProperty = tt.identifier(property.value);
  const newAssignment = tt.memberExpression(object, newProperty, false);
  return newAssignment;
}

module.exports = {
  parse
};
