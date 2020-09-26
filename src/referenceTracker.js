import * as tt from "@babel/types";
import ReferenceCounter from './transforms/utils/ReferenceCounter';
export const classRefTracker = new ReferenceCounter("Classes");

const ignoreList = ["Main"];

export function referenceTracker(path) {
  if (tt.isNewExpression(path.node)) {
    const { callee } = path.node;
    const shouldIgnore = ignoreList.some((i) => i !== callee.name);

    if (shouldIgnore === false) {
      classRefTracker.addReference(callee.name);
    }
  }
}