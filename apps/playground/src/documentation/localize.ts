import { translate } from "../i18n";
import russianMessages from "../i18n/messages/documentation.ru.json";

const originals = new Map<string, string>(Object.entries(russianMessages.strings).map(([key, text]) => [text, "documentation.strings." + key]));
const localized = new WeakMap<object, object>();
const sources = new WeakMap<object, object>();

/** Translate a prose string from a shared package catalogue at presentation time. */
export function translateDocumentationText(text: string): string {
  const key = originals.get(text);
  return key ? translate(key) : text;
}

/** Keep module metadata lazy so labels and descriptions follow the current locale. */
export function localizeDocumentation<T>(value: T): T {
  if (typeof value === "string") return (value.startsWith("documentation.strings.") ? translate(value) : value) as T;
  if (value === null || typeof value !== "object") return value;
  const cached = localized.get(value);
  if (cached) return cached as T;
  const proxy = new Proxy(value, {
    get(target, property, receiver) {
      return localizeDocumentation(Reflect.get(target, property, receiver));
    }
  });
  localized.set(value, proxy);
  sources.set(proxy, value);
  return proxy;
}

/** Read raw keys when deriving module-level metadata; translate only when it is rendered. */
export function documentationMetadataSource<T>(value: T): T {
  return (value !== null && typeof value === "object" ? sources.get(value) ?? value : value) as T;
}
