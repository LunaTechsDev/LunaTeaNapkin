import * as tt from "@babel/types";

export default function varMemberExprToExpr(declaration) {
  const { id, init } = declaration;
  if (init && init.object && init.object.name === "_$LTGlobals_$") {
    const { property, object } = init;
    const newExpression = tt.variableDeclarator(
      tt.identifier(id.name),
      tt.identifier(property.name)
    );
    return newExpression;
  }
}
