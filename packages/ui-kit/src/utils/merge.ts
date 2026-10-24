type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

/**
 * Deep-merges `source` onto `target`, returning a new object.
 * Plain objects merge recursively; anything else (arrays, functions,
 * primitives) is replaced by the source value when it is not `undefined`.
 */
export function deepMerge<T extends AnyRecord>(target: T, source?: AnyRecord): T {
  const out: AnyRecord = { ...target };
  if (!source) return out as T;

  for (const [key, value] of Object.entries(source)) {
    if (["__proto__", "constructor", "prototype"].includes(key)) continue;
    const prev = out[key];
    if (isRecord(prev) && isRecord(value)) {
      out[key] = deepMerge(prev, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }

  return out as T;
}
