#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var babelTraverse = require('@babel/traverse');
var babelGenerator = require('@babel/generator');
var tt = require('@babel/types');
var prettier = require('prettier');
var yargs = require('yargs');
var fs = require('fs.promises');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var babelTraverse__default = /*#__PURE__*/_interopDefaultLegacy(babelTraverse);
var babelGenerator__default = /*#__PURE__*/_interopDefaultLegacy(babelGenerator);
var prettier__default = /*#__PURE__*/_interopDefaultLegacy(prettier);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

class ReferenceCounter {
  constructor(name) {
    this.name = name || "Counter";
    this._references = new Map();
  }

  addReference(identifier, path) {
    if (this._references.has(identifier)) {
      const reference = this._references.get(identifier);

      const count = reference.count + 1;

      if (path === null) {
        path = reference.path;
      }

      this._references.set(identifier, Object.assign(reference, {
        count,
        path
      }));

      return;
    }

    this._references.set(identifier, {
      count: 1,
      path
    });
  }

  has(identifier) {
    return this._references.has(identifier);
  }

  getCount(identifier) {
    const reference = this._references.get(identifier);

    return reference.count;
  }

  getReferences(identifier) {
    if (identifier) {
      return this._references.get(identifier);
    }

    return this._references;
  }

}

const classRefTracker = new ReferenceCounter("Classes");
function referenceTracker(path) {
  if (tt.isNewExpression(path.node)) {
    const {
      callee
    } = path.node;
    classRefTracker.addReference(callee.name);
  }

  if (tt.isMemberExpression(path.node.callee)) {
    var _path$node$callee, _path$node$callee$obj;

    const name = (_path$node$callee = path.node.callee) === null || _path$node$callee === void 0 ? void 0 : (_path$node$callee$obj = _path$node$callee.object) === null || _path$node$callee$obj === void 0 ? void 0 : _path$node$callee$obj.name;

    if (name) {
      classRefTracker.addReference(path.node.callee.object.name);
    }
  }

  if (tt.isAssignmentExpression(path.node)) {
    var _path$node$left, _path$node$left$objec, _path$node$left2, _path$node$left2$obje;

    const exprName = (_path$node$left = path.node.left) === null || _path$node$left === void 0 ? void 0 : (_path$node$left$objec = _path$node$left.object) === null || _path$node$left$objec === void 0 ? void 0 : _path$node$left$objec.name;
    const nestedExprName = (_path$node$left2 = path.node.left) === null || _path$node$left2 === void 0 ? void 0 : (_path$node$left2$obje = _path$node$left2.object) === null || _path$node$left2$obje === void 0 ? void 0 : _path$node$left2$obje.object;

    if (exprName) {
      classRefTracker.addReference(exprName);
    }

    if (nestedExprName) {
      classRefTracker.addReference(nestedExprName);
    }
  }

  if (tt.isClassDeclaration(path.node)) {
    var _path$node$id;

    const name = (_path$node$id = path.node.id) === null || _path$node$id === void 0 ? void 0 : _path$node$id.name;

    if (name) {
      classRefTracker.addReference(path.node.id.name, path);
    }
  }

  if (tt.isVariableDeclaration(path.node)) {
    var _path$node$declaratio, _path$node$declaratio2, _path$node$declaratio3, _path$node$declaratio4;

    const name = (_path$node$declaratio = path.node.declarations[0]) === null || _path$node$declaratio === void 0 ? void 0 : (_path$node$declaratio2 = _path$node$declaratio.init) === null || _path$node$declaratio2 === void 0 ? void 0 : (_path$node$declaratio3 = _path$node$declaratio2.object) === null || _path$node$declaratio3 === void 0 ? void 0 : (_path$node$declaratio4 = _path$node$declaratio3.object) === null || _path$node$declaratio4 === void 0 ? void 0 : _path$node$declaratio4.name;

    if (name) {
      classRefTracker.addReference(name);
    }
  }
}

function cleanCommentSymbols(comments) {
  const lineComments = comments.filter(c => c.type === "CommentLine");
  lineComments.forEach(comment => {
    if (comment.value.includes("@")) {
      comment.value = comment.value.replace(/"@|@"/g, "");
    }
  });
}

function isVarMemberExpr(node) {
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

function isVarMemberIdentifier(node) {
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

function varMemberExprToExpr(declaration) {
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

function nestedToPropExpr(init) {
  const {
    object
  } = init.object;

  if ((object === null || object === void 0 ? void 0 : object.object) && object.object.name === "_$LTGlobals_$") {
    const {
      property,
      object
    } = init;
    const newObject = tt.identifier(object.object.property.name);
    const newExpression = tt.memberExpression(newObject, object.property, false);
    return newExpression;
  }
}

function nestedToCallExpr(callee) {
  var _callee$object, _callee$object$object;

  if ((callee === null || callee === void 0 ? void 0 : (_callee$object = callee.object) === null || _callee$object === void 0 ? void 0 : (_callee$object$object = _callee$object.object) === null || _callee$object$object === void 0 ? void 0 : _callee$object$object.name) === "_$LTGlobals_$") {
    const newObject = tt.identifier(callee.object.property.name);
    const newExpression = tt.memberExpression(newObject, callee.property, false);
    return newExpression;
  }
}

function convertCallExprArgs(node) {
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

// Utils
function removeUnwantedIdentifier(path) {
  const {
    node
  } = path;

  if (tt.isVariableDeclaration(node)) {
    if (isVarMemberExpr(node)) {
      const {
        init
      } = node.declarations[0];
      const newExpression = nestedToPropExpr(init);

      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.object = newExpression;
      }
    } else if (isVarMemberExpr(node)) {
      const {
        init
      } = node.declarations[0];
      const newExpression = nestedToCallExpr(init.callee);

      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.callee = newExpression;
      }
    } else if (isVarMemberIdentifier(node)) {
      const declaration = node.declarations[0];
      const iss = isVarMemberIdentifier(node);
      const newExpression = varMemberExprToExpr(declaration);

      if (newExpression) {
        node.declarations.splice(0, 1, newExpression);
      }
    }
  }

  if (tt.isCallExpression(node)) {
    convertCallExprArgs(node);
    const {
      callee
    } = node;

    if (tt.isMemberExpression(callee === null || callee === void 0 ? void 0 : callee.object)) {
      var _object$object;

      const {
        object
      } = callee;

      if ((object === null || object === void 0 ? void 0 : (_object$object = object.object) === null || _object$object === void 0 ? void 0 : _object$object.name) === "_$LTGlobals_$") {
        const newExpression = nestedToCallExpr(callee);
        node.callee = newExpression;
      }
    }
  }

  if (tt.isAssignmentExpression(node)) {
    var _node$left, _node$left$object, _node$left$object$obj;

    if (((_node$left = node.left) === null || _node$left === void 0 ? void 0 : (_node$left$object = _node$left.object) === null || _node$left$object === void 0 ? void 0 : (_node$left$object$obj = _node$left$object.object) === null || _node$left$object$obj === void 0 ? void 0 : _node$left$object$obj.name) === "_$LTGlobals_$") {
      const {
        left
      } = node;
      const newLeft = tt.memberExpression(left.object.property, left.property);
      const newAssignmentExpr = tt.assignmentExpression(node.operator, newLeft, node.right);
      path.replaceWith(newAssignmentExpr);
    }
  }

  if (tt.isBinaryExpression(node)) {
    var _node$left2, _node$left2$object;

    const left = (_node$left2 = node.left) === null || _node$left2 === void 0 ? void 0 : (_node$left2$object = _node$left2.object) === null || _node$left2$object === void 0 ? void 0 : _node$left2$object.object;

    if (left && left.name === "_$LTGlobals_$") {
      const newLeft = tt.memberExpression(node.left.object.property, node.left.property);
      path.replaceWith(tt.binaryExpression(node.operator, newLeft, node.right));
    }
  }

  if (tt.isExpressionStatement(node)) {
    var _left$property, _left$object, _left$object2, _left$object2$object, _right$object, _right$object$object;

    const {
      expression
    } = node;
    const {
      left,
      right
    } = expression;

    if ((left === null || left === void 0 ? void 0 : (_left$property = left.property) === null || _left$property === void 0 ? void 0 : _left$property.name) === "__name__" && (left === null || left === void 0 ? void 0 : (_left$object = left.object) === null || _left$object === void 0 ? void 0 : _left$object.name) === "_$LTGlobals_$") {
      path.remove();
    }

    if ((left === null || left === void 0 ? void 0 : (_left$object2 = left.object) === null || _left$object2 === void 0 ? void 0 : (_left$object2$object = _left$object2.object) === null || _left$object2$object === void 0 ? void 0 : _left$object2$object.name) === "_$LTGlobals_$") {
      const newLeft = tt.memberExpression(left.object.property, left.property);
      const newAssignment = tt.assignmentExpression(expression.operator, newLeft, expression.right);
      path.replaceWith(newAssignment);
    }

    if ((right === null || right === void 0 ? void 0 : (_right$object = right.object) === null || _right$object === void 0 ? void 0 : (_right$object$object = _right$object.object) === null || _right$object$object === void 0 ? void 0 : _right$object$object.name) === "_$LTGlobals_$") {
      const newRight = tt.memberExpression(right.object.property, right.property);
      const newAssignment = tt.assignmentExpression(expression.operator, expression.left, newRight);
      path.replaceWith(newAssignment);
    }
  }
}

/**
 * Checks if there is an assignment expression for a class prototype using
 * bracket notation.
 *
 * @param {Node} node The AST node from babels parser
 *
 * @example Class.prototype['methodName']
 */

function isProtoLiteralAssignment(node) {
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

/**
 * Checks if there is a variable declaration for a class prototype using bracket
 * notation.
 *
 * @param {Node} node The AST node from babels parser
 *
 * @example var alias = Class.prototype['methodName']
 */

function isProtoLiteralVar(node) {
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

/**
 * Converts prototype literal assignments and declarations
 *
 * @param {Node} node The AST node from babels parser
 * @example
 * var alias = Class.prototype['methodName'] - > var alias = Class.prototype.methodName;
 *
 * Class.prototype['methodName'] = function (){} -> Class.prototype.methodName = function (){}
 */

function protoLiteralToObj(node) {
  if (isProtoLiteralAssignment(node)) {
    const {
      property,
      object
    } = node.left;
    const newLeft = literalToObject(node.left);
    node.left = newLeft;
  } else if (isProtoLiteralVar(node)) {
    const {
      init
    } = node.declarations[0];
    const newInit = literalToObject(init);
    node.declarations[0].init = newInit;
  }
}

function lunaTeaTransformer(ast, path) {
  cleanCommentSymbols(ast.comments);
  removeUnwantedIdentifier(path);
  protoLiteralToObj(path.node);
}

const traverse = babelTraverse__default['default'];
const generate = babelGenerator__default['default'];
/**
 * Parses the code with prettier and applies specific transformation for the
 * output of plugins developed with LunaTea.
 *
 * @param {String} code The code to transform and prettify.
 * @param {Bool} usePretty Set to false to disable the use of pretty on the transformed code
 */

function parse(code, usePretty = true) {
  return prettier__default['default'].format(code, {
    parser(text, {
      babel
    }) {
      const ast = babel(text);
      traverse(ast, {
        enter(path) {
          referenceTracker(path);
          lunaTeaTransformer(ast, path);
        }

      });
      const refs = classRefTracker.getReferences();

      for (let [key, value] of refs) {
        if (value.count <= 1 && value.path && tt.isClassDeclaration(value.path.node)) {
          value.path.remove();
        }
      }

      const codeTransformations = generate(ast, {
        retainLines: true
      }).code;

      if (usePretty === false) {
        return codeTransformations;
      }

      return prettier__default['default'].format(codeTransformations, {
        endOfLine: "lf",
        parser: "babel"
      });
    }

  });
}

const TARGET_DIR = yargs.argv.path ? path__default['default'].resolve(yargs.argv.path) : path__default['default'].resolve("dist");
const usePretty = yargs.argv.pretty === undefined ? true : yargs.argv.pretty;

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
    const paths = await fs__default['default'].readdir(TARGET_DIR);
    paths.forEach(async path => {
      const data = await fs__default['default'].readFile(`${TARGET_DIR}/${path}`, {
        encoding: "utf8"
      });
      const result = parse(data, usePretty);
      await fs__default['default'].writeFile(`${TARGET_DIR}/${path}`, buildComment(path) + result, {
        encoding: "utf8"
      });
    });
  })().catch(error => {
    process.exitCode = 1;
    console.error(error);
  });
}

exports.parse = parse;
