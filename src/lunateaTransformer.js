import cleanCommentSymbols from "./transforms/cleanCommentSymbols";
import removeEmptyClasses from "./transforms/removeEmptyClasses";
import removeUnwantedIdentifiers from "./transforms/removeUnwantedIdentifiers";
import protoLiteralToObject from "./transforms/protoLiteralToObject";

export default function lunaTeaTransformer(ast, path) {
  cleanCommentSymbols(ast.comments);
  removeEmptyClasses(path);
  removeUnwantedIdentifiers(path);
  protoLiteralToObject(path.node);
}
