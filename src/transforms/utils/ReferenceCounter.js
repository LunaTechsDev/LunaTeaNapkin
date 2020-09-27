export default class ReferenceCounter {
  constructor(name) {
    this.name = name || "Counter";
    this._references = new Map();
  }

  addReference(identifier, path) {
    if (this._references.has(identifier)) {
      const reference = this._references.get(identifier);
      const count = reference.count + 1;
      if (path === null) {
        path = reference.path;
      }
      this._references.set(
        identifier,
        Object.assign(reference, { count, path })
      );
      return;
    }
    this._references.set(identifier, { count: 1, path });
  }

  has(identifier) {
    return this._references.has(identifier);
  }

  getCount(identifier) {
    const reference = this._references.get(identifier);
    return reference.count;
  }

  getReferences(identifier) {
    if (identifier) {
      return this._references.get(identifier);
    }
    return this._references;
  }
}
