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
}
