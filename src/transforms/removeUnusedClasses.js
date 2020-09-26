import * as tt from "@babel/types";
import { classRefTracker } from "../referenceTracker";

export default function removeUnusedClasses(path) {
  const { node } = path;

  if (tt.isClassDeclaration(node)) {
      if (!classRefTracker.has(node.id.name)) {
        path.remove();
      }
  }
}
