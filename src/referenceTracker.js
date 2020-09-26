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
        const name = path.node.left?.object?.name;
        if (name) {
          classRefTracker.addReference(path.node.left.object.name);
        }
  }
  if (tt.isClassDeclaration(path.node)) {
    const name = path.node.id?.name
    if (name) {
      classRefTracker.addReference(path.node.id.name, path);
    }
  }
}
