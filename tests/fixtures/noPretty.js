const singleString = 'single-quoted string'

const array = [1, 2, 3];

const obj = {even: 'string', spacing: false}

const obj2 = {
  even: 'string', spacing: false,
  wth: 'isThis'
}

class MyClass {
  myMethod() {}
}

const alias = MyClass.prototype["myMethod"]
const alias2 = MyClass.prototype["myMethod"];
const alias3 = MyClass.prototype["myMethod"];

class MyClassB {
  myMethod() {}
}

MyClassB.prototype["myMethod"] = function () {}

MyClassB.prototype["newMethod"] = function () {};

let uiAreaWidth = _$LTGlobals_$.$dataSystem.advanced.uiAreaWidth;

let padding = _$LTGlobals_$.$gameSystem.windowPadding()

// Call expressions
_$LTGlobals_$.$gameSystem.windowPadding();
_$LTGlobals_$.$gameSwitches.setValue(data.id, data.value);
