export default class ReferenceCounter {
  constructor(name) {
    this.name = name || "Counter";
    this._references = new Map();
  }

  addReference(identifier, path) {
    if (this._references.has(identifier)) {
      const reference = this._references.get(identifier);
      this._references.set(identifier, { count: reference.count + 1 });
      return;
    }
    this._references.set(identifier, { count: 1, path });
  }

  has(identifier) {
    return this._references.has(identifier);
  }
}
