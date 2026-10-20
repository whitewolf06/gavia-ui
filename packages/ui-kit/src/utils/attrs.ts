/** Last defined scalar wins; class/style remain arrays understood by Vue's renderer. */
export function mergeWlAttrs(...parts: Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (value === undefined || key === "__proto__" || key === "prototype" || key === "constructor") continue;
      result[key] = key === "class" || key === "style" ? [result[key], value].filter(Boolean) : value;
    }
  }
  return result;
}
