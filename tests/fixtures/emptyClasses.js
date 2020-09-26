class MyClassA {}

class MyClassB {}

class MyClassC {}

class MyClassD {
  myMethod() {}
}

// Part of default ignore list
class Main {
  static main() {};
}

class windows_Window_$GameEnd extends Window_GameEnd {
  constructor() {
    super();
  }
  maxItems() {
    return Window_Command.prototype.maxItems.call(this);
  }
}

var myClass = new MyClassC();
randomCallExpr(new MyClassC());