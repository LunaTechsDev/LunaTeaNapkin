import * as tt from "@babel/types";
import nestedToCallExpr from './nestedToCallExpr'

export default function convertCallExprArgs(node) {
  for (const [index, arg] of node.arguments.entries()) {
    if (tt.isCallExpression(arg)) {
      // perform call expression transform
      if (node.callee?.object?.name === "_$LTGlobals_$") {
        const newCallExpression = nestedToCallExpr(arg.callee);
        node.arguments[index] = newCallExpression;
      }
    } else if (tt.isMemberExpression(arg.object)) {
      if (arg.object.object.name === "_$LTGlobals_$") {
        const newObject = tt.identifier(arg.object.property.name);
        const newExpression = tt.memberExpression(
          newObject,
          arg.property,
          false
        );
        node.arguments[index] = newExpression;
      }
    } else if (tt.isIdentifier(arg.object)) {
      if (arg.object.name === "_$LTGlobals_$") {
        node.arguments[index] = tt.identifier(arg.property.name);
      }
    }
  }
}
