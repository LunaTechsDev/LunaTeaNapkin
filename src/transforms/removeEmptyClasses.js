import * as tt from "@babel/types";

export default function removeEmptyClasses(path, onRemove) {
  const { node } = path;
  if (tt.isClassDeclaration(node)) {
    if (node.body.body.length <= 0) {
      if (typeof onRemove === "function") {
        onRemove(node.id);
      }
      path.remove();
    }
  }
}
