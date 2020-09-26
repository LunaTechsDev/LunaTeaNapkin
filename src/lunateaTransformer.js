import cleanCommentSymbols from "./transforms/cleanCommentSymbols";
import removeUnwantedIdentifiers from "./transforms/removeUnwantedIdentifiers";
import protoLiteralToObject from "./transforms/protoLiteralToObject";

export default function lunaTeaTransformer(ast, path) {
  cleanCommentSymbols(ast.comments);
  removeUnwantedIdentifiers(path);
  protoLiteralToObject(path.node);
}
