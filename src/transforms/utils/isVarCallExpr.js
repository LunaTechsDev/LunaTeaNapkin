import * as tt from '@babel/types';

export default function isVarCallExpr(node) {
  const { declarations } = node;
  if (declarations) {
    const { init } = declarations[0];
    return init && tt.isCallExpression(init);
  }
  return false;
}
