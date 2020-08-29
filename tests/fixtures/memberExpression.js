class MyClass {
  myMethod() {}
}

MyClass.prototype['myMethod'] = function () {}

MyClass.prototype['newMethod'] = function () {}