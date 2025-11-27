/** @typedef {Record<string, unknown>} Token */

/**
 * An iterable version of [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet).
 *
 * @example Usage
 * ```ts
 * const set = new IterableWeakSet<(() => void)>();
 *
 * const listener = () => console.log("event");
 * set.add(listener);
 * for (const item of set) item();
 * set.delete(listener);
 * ```
 * 
 * @template {WeakKey} T
 */
export class IterableWeakSet {
  /** @readonly */
  static [Symbol.species] = IterableWeakSet;
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. @readonly @type {WeakMap<T, WeakRef<T>>} */
  #refs = new WeakMap();
  /** A map of all weak refs and their registration tokens. @readonly @type {Map<WeakRef<T>, Token>} */
  #tokens = new Map();
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. @readonly @type {FinalizationRegistry<WeakRef<T>>} */
  #registry = new FinalizationRegistry((ref) => this.#tokens.delete(ref));

  /**
   * Creates an iterable version of WeakSet.
   * @param {readonly T[] | Iterable<T> | null} [iterable=] Iterable to construct this IterableWeakSet from
   */
  constructor(iterable) {
    if (iterable) { for (const entry of iterable) this.add(entry); }
  }

  /**
   * Returns the number of (unique) elements in IterableWeakSet.
   * @returns {number} The number of (unique) elements in IterableWeakSet
   */
  get size() {
    // We can't rely on token map for size since it can contain empty weak refs,
    // so we iterate over the entire map and skip GC'ed entries: see [Symbol.iterator] method above
    let size = 0;
    for (const _ of this) size += 1;
    return size;
  }

  /**
   * Checks whether an element with the specified value exists in the IterableWeakSet or not.
   * @param {T} value
   * @returns {boolean} A boolean indicating whether an element with the specified value exists in the IterableWeakSet or not
   */
  has(value) {
    return this.#refs.has(value);
  }

  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value {T} A value to add
   * @returns {this} The original IterableWeakSet
   */
  add(value) {
    if (!this.has(value)) {
      /** @type {Token} */
      const token = {};
      const ref = new WeakRef(value);

      this.#refs.set(value, ref);
      this.#tokens.set(ref, token);
      this.#registry.register(value, ref, token);
    }

    return this;
  }

  /**
   * Removes a specified value from the IterableWeakSet.
   * @param {T} value A value to remove
   * @returns {boolean} Returns true if an element in the IterableWeakSet existed and has been removed, or false if the element does not exist
   */
  delete(value) {
    const ref = this.#refs.get(value);
    if (!ref) return false;

    this.#refs.delete(value);
    this.#registry.unregister(this.#tokens.get(ref));
    this.#tokens.delete(ref);

    return true;
  }

  /** 
   * Purges all existing elements from the IterableWeakSet.
   * @returns {void}
   */
  clear() {
    for (const value of this) this.delete(value);
  }

  /**
   * Executes a provided function once per each value in the IterableWeakSet object, in insertion order.
   * @param cb {(value: T, key: T, set: IterableWeakSet<T>) => void} A function to use with each value
   * @param thisArg {unknown} A reference to an object to use as this inside the callback function
   * @returns {void}
   */
  forEach(cb, thisArg) {
    for (const value of this) cb.call(thisArg, value, value, this);
  }

  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns {SetIterator<T>} IterableIterator that produces currently existing elements
   */
  *[Symbol.iterator]() {
    for (const [ref, token] of this.#tokens) {
      const value = ref.deref();

      // Although token map should be clear of any empty weak refs by this point, there's no guarantee that it will be:
      // after testing with forced GC (through --expose-gc), Node/Deno do NOT call FinalizationRegistry callbacks immediately
      // which can lead to token map containing empty refs for some time
      if (value) {
        yield value;
      } else {
        this.#tokens.delete(ref);
        this.#registry.unregister(token);
      }
    }
  }

  /**
   * Returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
   * @returns {SetIterator<[T, T]>} IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
   */
  *entries() {
    for (const value of this) yield [value, value];
  }
}

// Prototype optimiations

/** It's weak set iterating time. @readonly */
IterableWeakSet.prototype[Symbol.toStringTag] = "IterableWeakSet";

/**
 * Returns IterableIterator that produces currently existing elements
 * @returns {SetIterator<T>} IterableIterator that produces currently existing elements
 */
IterableWeakSet.prototype.keys = IterableWeakSet.prototype.values = IterableWeakSet.prototype[Symbol.iterator];
