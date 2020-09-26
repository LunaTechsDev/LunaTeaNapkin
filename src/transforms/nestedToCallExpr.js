import * as tt from '@babel/types';

export default function nestedToCallExpr(callee) {
  if (callee?.object?.object?.name === "_$LTGlobals_$") {
    const newObject = tt.identifier(callee.object.property.name);
    const newExpression = tt.memberExpression(
      newObject,
      callee.property,
      false
    );
    return newExpression;
  }
}
