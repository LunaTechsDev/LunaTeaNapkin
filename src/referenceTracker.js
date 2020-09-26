import * as tt from "@babel/types";
import ReferenceCounter from './transforms/utils/ReferenceCounter';
export const classRefTracker = new ReferenceCounter("Classes");

export function referenceTracker(path) {
  if (tt.isNewExpression(path.node)) {
    const { callee } = path.node;
    classRefTracker.addReference(callee.name);
  }
}