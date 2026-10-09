import { wlManifest, type WlComponentManifest } from "../../../../packages/ui-kit/src/manifest";
import { translateDocumentationText } from "./localize";

const entries = new WeakMap<object, object>();
function localizedEntry<T extends object>(entry: T): T {
  const cached = entries.get(entry);
  if (cached) return cached as T;
  const proxy = new Proxy(entry, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      if (property === "description" && typeof value === "string") return translateDocumentationText(value);
      return value !== null && typeof value === "object" ? localizedEntry(value) : value;
    }
  });
  entries.set(entry, proxy);
  return proxy;
}

/** Localized descriptions for Playground; public API identifiers and values stay unchanged. */
export function getLocalizedManifest(): WlComponentManifest[] {
  return wlManifest.map((entry) => localizedEntry(entry));
}
