import * as tt from "@babel/types";
import ReferenceCounter from "./transforms/utils/ReferenceCounter";
export const classRefTracker = new ReferenceCounter("Classes");

export function referenceTracker(path) {
  if (tt.isNewExpression(path.node)) {
    const { callee } = path.node;
    classRefTracker.addReference(callee.name);
  }
  if (tt.isMemberExpression(path.node.callee)) {
    const name = path.node.callee?.object?.name;
    if (name) {
      classRefTracker.addReference(path.node.callee.object.name);
    }
  }
  if (tt.isAssignmentExpression(path.node)) {
    const exprName = path.node.left?.object?.name;
    const nestedExprName = path.node.left?.object?.object;
    if (exprName) {
      classRefTracker.addReference(exprName);
    }
    if (nestedExprName) {
      classRefTracker.addReference(nestedExprName);
    }
  }
  if (tt.isClassDeclaration(path.node)) {
    const name = path.node.id?.name;
    if (name) {
      classRefTracker.addReference(path.node.id.name, path);
    }
  }
  if (tt.isVariableDeclaration(path.node)) {
    const name = path.node.declarations[0]?.init?.object?.object?.name;
    if (name) {
      classRefTracker.addReference(name);
    }
  }
}
