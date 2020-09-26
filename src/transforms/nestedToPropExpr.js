import * as tt from "@babel/types";

export default function nestedToPropertyExpr(init) {
  const { object } = init.object;
  if (object.object && object.object.name === "_$LTGlobals_$") {
    const { property, object } = init;
    const newObject = tt.identifier(object.object.property.name);
    const newExpression = tt.memberExpression(
      newObject,
      object.property,
      false
    );
    return newExpression;
  }
}
