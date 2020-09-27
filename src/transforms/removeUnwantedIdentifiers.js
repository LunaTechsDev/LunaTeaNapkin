// Utils
import isVarMemberExpr from "./utils/isVarMemberExpr";
import isVarCallExpr from "./utils/isVarMemberExpr";
import isVarMemberIdentifier from "./utils/isVarMemberIdentifier";

// Transforms
import varMemberExprToExpr from "./varMemberExprToExpr";
import nestedToPropExpr from "./nestedToPropExpr";
import nestedToCallExpr from "./nestedToCallExpr";
import convertCallExprArgs from "./convertCallExprArgs";

import * as tt from "@babel/types";

export default function removeUnwantedIdentifier(path) {
  const { node } = path;

  if (tt.isVariableDeclaration(node)) {
    if (isVarMemberExpr(node)) {
      const { init } = node.declarations[0];
      const newExpression = nestedToPropExpr(init);
      if (tt.isMemberExpression(newExpression)) {
        node.declarations[0].init.object = newExpression;
      }
    } else if (isVarCallExpr(node)) {
      const { init } = node.declarations[0];
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
    const { callee } = node;
    if (tt.isMemberExpression(callee?.object)) {
      const { object } = callee;
      if (object?.object?.name === "_$LTGlobals_$") {
        const newExpression = nestedToCallExpr(callee);
        node.callee = newExpression;
      }
    }
  }
  if (tt.isAssignmentExpression(node)) {
    if (node.left?.object?.object?.name === "_$LTGlobals_$") {
      const { left } = node;
      const newLeft = tt.memberExpression(left.object.property, left.property);
      const newAssignmentExpr = tt.assignmentExpression(
        node.operator,
        newLeft,
        node.right
      );
      path.replaceWith(newAssignmentExpr);
    }
  }

  if (tt.isBinaryExpression(node)) {
    const left = node.left?.object?.object;
    if (left && left.name === "_$LTGlobals_$") {
      console.log("found");
      const newLeft = tt.memberExpression(
        node.left.object.property,
        node.left.property
      );
      path.replaceWith(tt.binaryExpression(node.operator, newLeft, node.right));
    }
  }

  if (tt.isExpressionStatement(node)) {
    const { expression } = node;
    const { left, right } = expression;
    if (left?.object?.object?.name === "_$LTGlobals_$") {
      const newLeft = tt.memberExpression(left.object.property, left.property);
      const newAssignment = tt.assignmentExpression(
        expression.operator,
        newLeft,
        expression.right
      );
      path.replaceWith(newAssignment);
    }

    if (right?.object?.object?.name === "_$LTGlobals_$") {
      const newRight = tt.memberExpression(
        right.object.property,
        right.property
      );
      const newAssignment = tt.assignmentExpression(
        expression.operator,
        expression.left,
        newRight
      );
      path.replaceWith(newAssignment);
    }
  }
}
