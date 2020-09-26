import * as tt from "@babel/types";
import { classRefTracker } from "../referenceTracker";

const allowList = [
  'Main'
]

export default function removeUnusedClasses(path) {
  const { node } = path;

  if (tt.isClassDeclaration(node)) {
    if (allowList.some(i => i === node.id.name)) {
      return;
    }
      if (!classRefTracker.has(node.id.name)) {
        path.remove();
      }
  }
}
