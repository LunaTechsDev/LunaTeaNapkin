class MyClassA {}

class MyClassB {}

class MyClassC {}

class MyClassD {
  myMethod() {}
}

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

Main.main();
Main.params = [];
var myClass = new MyClassC();
randomCallExpr(new MyClassD());