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
export declare class IterableWeakSet<T extends WeakKey> {
  #private;
  /** It's weak set iterating time. */
  static readonly [Symbol.species]: typeof IterableWeakSet;
  /** It's weak set iterating time. */
  readonly [Symbol.toStringTag]: string;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  keys(): SetIterator<T>;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  values(): SetIterator<T>;
  /**
   * Creates an iterable version of WeakSet.
   * @param iterable Iterable to construct this IterableWeakSet from
   */
  constructor(iterable?: readonly T[] | Iterable<T> | null);
  /**
   * Returns the number of (unique) elements in IterableWeakSet.
   * @returns The number of (unique) elements in IterableWeakSet
   */
  get size(): number;
  /**
   * Checks whether an element with the specified value exists in the IterableWeakSet or not.
   * @param value
   * @returns A boolean indicating whether an element with the specified value exists in the IterableWeakSet or not
   */
  has(value: T): boolean;
  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value A value to add
   * @returns The original IterableWeakSet
   */
  add(value: T): this;
  /**
   * Removes a specified value from the IterableWeakSet.
   * @param value A value to remove
   * @returns Returns true if an element in the IterableWeakSet existed and has been removed, or false if the element does not exist
   */
  delete(value: T): boolean;
  /** Purges all existing elements from the IterableWeakSet. */
  clear(): void;
  /**
   * Executes a provided function once per each value in the IterableWeakSet object, in insertion order.
   * @param cb A function to use with each value
   * @param thisArg A reference to an object to use as this inside the callback function
   */
  forEach(
    cb: (value: T, key: T, set: IterableWeakSet<T>) => void,
    thisArg: unknown,
  ): void;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  [Symbol.iterator](): SetIterator<T>;
  /**
   * Returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
   * @returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
   */
  entries(): SetIterator<[T, T]>;
}
