import { createI18n, useI18n } from "vue-i18n";
import { watch } from "vue";
import { playgroundLocale, type PlaygroundLocale } from "./locale";
export { playgroundLocale, parsePlaygroundLocale, type PlaygroundLocale } from "./locale";


import shellEN from "./messages/shell.en.json" with { type: "json" };
import shellRU from "./messages/shell.ru.json" with { type: "json" };
import documentationEN from "./messages/documentation.en.json" with { type: "json" };
import documentationRU from "./messages/documentation.ru.json" with { type: "json" };
import examplesEN from "./messages/examples.en.json" with { type: "json" };
import examplesRU from "./messages/examples.ru.json" with { type: "json" };
import tokensEN from "./messages/tokens.en.json" with { type: "json" };
import tokensRU from "./messages/tokens.ru.json" with { type: "json" };
import changelogEN from "./messages/changelog.en.json" with { type: "json" };
import changelogRU from "./messages/changelog.ru.json" with { type: "json" };

const catalogs: Record<string, Record<string, unknown>> = {
  "./messages/shell.en.json": shellEN,
  "./messages/shell.ru.json": shellRU,
  "./messages/documentation.en.json": documentationEN,
  "./messages/documentation.ru.json": documentationRU,
  "./messages/examples.en.json": examplesEN,
  "./messages/examples.ru.json": examplesRU,
  "./messages/tokens.en.json": tokensEN,
  "./messages/tokens.ru.json": tokensRU,
  "./messages/changelog.en.json": changelogEN,
  "./messages/changelog.ru.json": changelogRU
};
const messages: Record<PlaygroundLocale, Record<string, string>> = { en: {}, ru: {} };
function flatten(value: Record<string, unknown>, target: Record<string, string>, prefix = ""): void {
  for (const [key, item] of Object.entries(value)) {
    const path = prefix ? prefix + "." + key : key;
    if (typeof item === "string") target[path] = item;
    else if (item && typeof item === "object" && !Array.isArray(item)) flatten(item as Record<string, unknown>, target, path);
  }
}
for (const [path, catalog] of Object.entries(catalogs)) {
  const language = path.endsWith(".ru.json") ? "ru" : "en";
  const namespace = path.split("/").pop()!.split(".")[0]!;
  const prefix = Object.keys(catalog).some((key) => key.includes(".") || key === namespace) ? "" : namespace;
  flatten(catalog, messages[language], prefix);
}
type LiteralContext = { named: (name: string) => unknown };
/** Technical text (code, emails, pipes) stays literal; only named placeholders interpolate. */
function literalMessages(source: Record<string, string>): Record<string, (context: LiteralContext) => string> {
  return Object.fromEntries(Object.entries(source).map(([key, message]) => [
    key, (context: LiteralContext) => message.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = context.named(name);
      return value === undefined ? placeholder : String(value);
    })
  ]));
}
export const playgroundI18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: playgroundLocale.value,
  fallbackLocale: "en",
  flatJson: true,
  messages: { en: literalMessages(messages.en), ru: literalMessages(messages.ru) },
  missingWarn: Boolean(import.meta.env?.DEV),
  fallbackWarn: Boolean(import.meta.env?.DEV)
});
watch(playgroundLocale, (value) => { playgroundI18n.global.locale.value = value; }, { flush: "sync" });
export function usePlaygroundI18n() { return useI18n({ useScope: "global" }); }
export function translate(key: string, values: Record<string, string | number> = {}): string {
  return playgroundI18n.global.t(key, values);
}
export function setPlaygroundLocale(locale: PlaygroundLocale): void {
  playgroundLocale.value = locale;
  if (typeof document !== "undefined") document.documentElement.lang = locale;
}
export function createPlaygroundLocaleUrl(current: URL, locale: PlaygroundLocale): URL {
  const target = new URL(current.href);
  target.searchParams.set("lang", locale);
  return target;
}
/** Literal catalogs for exporting examples without a playground dependency. */
export function playgroundMessages(): Record<string, string> {
  return messages[playgroundLocale.value === "ru" ? "ru" : "en"];
}
