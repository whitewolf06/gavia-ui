export type PlaygroundNamespace = "shell" | "documentation" | "examples" | "tokens" | "changelog";

export function createCatalogLoader<Locale extends string, Namespace extends string, Resource>(
  loader: (locale: Locale, namespace: Namespace) => Promise<Resource>,
  accept: (locale: Locale, namespace: Namespace, resource: Resource) => void
): (locale: Locale, namespace: Namespace) => Promise<void> {
  const resources = new Map<string, Promise<void>>();
  return (locale, namespace) => {
    const key = locale + ":" + namespace;
    const previous = resources.get(key);
    if (previous) return previous;
    const pending = Promise.resolve().then(() => loader(locale, namespace)).then((resource) => {
      accept(locale, namespace, resource);
    }).catch((error: unknown) => {
      resources.delete(key);
      throw error;
    });
    resources.set(key, pending);
    return pending;
  };
}

export function flattenCatalog(catalog: Record<string, unknown>, namespace: string): Record<string, string> {
  const result: Record<string, string> = {};
  function visit(value: Record<string, unknown>, prefix: string): void {
    for (const [key, item] of Object.entries(value)) {
      const path = prefix ? prefix + "." + key : key;
      if (typeof item === "string") result[path] = item;
      else if (item && typeof item === "object" && !Array.isArray(item)) visit(item as Record<string, unknown>, path);
    }
  }
  visit(catalog, Object.keys(catalog).some((key) => key.includes(".") || key === namespace) ? "" : namespace);
  return result;
}

/** Compact reverse lookup; the build checks collisions against original text. */
export function catalogTextKey(text: string): string {
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < text.length; index++) {
    const value = text.charCodeAt(index);
    first = Math.imul(first ^ value, 0x01000193);
    second = Math.imul(second ^ value, 0x85ebca6b);
  }
  return (first >>> 0).toString(16).padStart(8, "0") + (second >>> 0).toString(16).padStart(8, "0");
}
