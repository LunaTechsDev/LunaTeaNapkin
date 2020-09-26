import cleanCommentSymbols from "./transforms/cleanCommentSymbols";
// import removeEmptyClasses from "./transforms/removeEmptyClasses";
import removeUnwantedIdentifiers from "./transforms/removeUnwantedIdentifiers";
import protoLiteralToObject from "./transforms/protoLiteralToObject";
import ReferenceCounter from './transforms/utils/ReferenceCounter';
// import removeUnusedClasses from './transforms/removeUnusedClasses'

export default function lunaTeaTransformer(ast, path) {
  cleanCommentSymbols(ast.comments);
  removeUnwantedIdentifiers(path);
  protoLiteralToObject(path.node);
}
