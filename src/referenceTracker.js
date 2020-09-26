import * as tt from "@babel/types";
import ReferenceCounter from "./transforms/utils/ReferenceCounter";
export const classRefTracker = new ReferenceCounter("Classes");

const ignoreList = ["Main"];

export function referenceTracker(path) {
  if (tt.isNewExpression(path.node)) {
    const { callee } = path.node;
    const shouldIgnore = ignoreList.some((i) => i === callee.name);

    if (shouldIgnore === false) {
      classRefTracker.addReference(callee.name, path);
    }
  }
  if (tt.isMemberExpression(path.node.callee)) {
    const name = path.node.callee.object.name;
    if (name) {
      classRefTracker.addReference(path.node.callee.object.name, path);
    }
  }
  if (tt.isAssignmentExpression(path.node)) {
        const name = path.node.callee.object.name;
        if (name) {
          classRefTracker.addReference(path.node.callee.object.name, path);
        }
  }
}
