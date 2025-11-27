type Token = Record<string, unknown>;

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
 */
export class IterableWeakSet<T extends WeakKey> {
  static readonly [Symbol.species] = IterableWeakSet;
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. */
  readonly #refs: WeakMap<T, WeakRef<T>> = new WeakMap();
  /** A map of all weak refs and their registration tokens. */
  readonly #tokens: Map<WeakRef<T>, Token> = new Map();
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. */
  readonly #registry: FinalizationRegistry<WeakRef<T>> =
    new FinalizationRegistry((ref) => this.#tokens.delete(ref));

  /**
   * Creates an iterable version of WeakSet.
   * @param iterable Iterable to construct this IterableWeakSet from
   */
  constructor(iterable?: readonly T[] | Iterable<T> | null) {
    if (iterable) { for (const entry of iterable) this.add(entry); }
  }

  /**
   * Returns the number of (unique) elements in IterableWeakSet.
   * @returns The number of (unique) elements in IterableWeakSet
   */
  get size(): number {
    // We can't rely on token map for size since it can contain empty weak refs,
    // so we iterate over the entire map and skip GC'ed entries: see [Symbol.iterator] method above
    let size = 0;
    for (const _ of this) size += 1;
    return size;
  }

  /**
   * Checks whether an element with the specified value exists in the IterableWeakSet or not.
   * @param value
   * @returns A boolean indicating whether an element with the specified value exists in the IterableWeakSet or not
   */
  has(value: T): boolean {
    return this.#refs.has(value);
  }

  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value A value to add
   * @returns The original IterableWeakSet
   */
  add(value: T): this {
    if (!this.has(value)) {
      const token: Token = {};
      const ref = new WeakRef(value);

      this.#refs.set(value, ref);
      this.#tokens.set(ref, token);
      this.#registry.register(value, ref, token);
    }

    return this;
  }

  /**
   * Removes a specified value from the IterableWeakSet.
   * @param value A value to remove
   * @returns Returns true if an element in the IterableWeakSet existed and has been removed, or false if the element does not exist
   */
  delete(value: T): boolean {
    const ref = this.#refs.get(value);
    if (!ref) return false;

    this.#refs.delete(value);
    this.#registry.unregister(this.#tokens.get(ref)!);
    this.#tokens.delete(ref);

    return true;
  }

  /** Purges all existing elements from the IterableWeakSet. */
  clear(): void {
    for (const value of this) this.delete(value);
  }

  /**
   * Executes a provided function once per each value in the IterableWeakSet object, in insertion order.
   * @param cb A function to use with each value
   * @param thisArg A reference to an object to use as this inside the callback function
   */
  forEach(
    cb: (value: T, key: T, set: IterableWeakSet<T>) => void,
    thisArg: unknown,
  ): void {
    for (const value of this) cb.call(thisArg, value, value, this);
  }

  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  *[Symbol.iterator](): SetIterator<T> {
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
   * @returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
   */
  *entries(): SetIterator<[T, T]> {
    for (const value of this) yield [value, value];
  }
}

// Prototype optimizations
export interface IterableWeakSet<T extends WeakKey> {
  /** It's weak set iterating time. */
  readonly [Symbol.toStringTag]: string;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  keys(): IterableIterator<T>;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  values(): IterableIterator<T>;
}

// @ts-expect-error: self-evident
IterableWeakSet.prototype[Symbol.toStringTag] = "IterableWeakSet";

IterableWeakSet.prototype.keys =
  IterableWeakSet.prototype.values =
    IterableWeakSet.prototype[Symbol.iterator];
