type AnyRecord = Record<string, unknown>;
/**
 * Deep-merges `source` onto `target`, returning a new object.
 * Plain objects merge recursively; anything else (arrays, functions,
 * primitives) is replaced by the source value when it is not `undefined`.
 */
export declare function deepMerge<T extends AnyRecord>(target: T, source?: AnyRecord): T;
export {};
