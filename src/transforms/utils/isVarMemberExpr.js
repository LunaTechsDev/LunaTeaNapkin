import * as tt from '@babel/types';

export default function isVarMemberExpr(node) {
  const { declarations } = node;
  if (declarations) {
    const { init } = declarations[0];

    return (
      init &&
      tt.isMemberExpression(init) &&
      tt.isIdentifier(init.object) &&
      tt.isIdentifier(init.property)
    );
  }
  return false;
}
