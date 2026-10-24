import { shallowReactive, watch } from "vue";
import { createI18n, useI18n } from "vue-i18n";
import { catalogTextKey, createCatalogLoader, type PlaygroundNamespace } from "./catalog";
import { playgroundLocale, type PlaygroundLocale } from "./locale";
import { loadPlaygroundCatalogResource, namespacesForPlaygroundView } from "./preload";
export { namespacesForPlaygroundView } from "./preload";
export { detectPlaygroundLocale, parsePlaygroundLocale, playgroundLocale, type PlaygroundLocale } from "./locale";
export type { PlaygroundNamespace } from "./catalog";

const originals: Record<PlaygroundLocale, Record<string, string>> = { en: {}, ru: {} };
const aliases = shallowReactive(new Map<PlaygroundNamespace, Record<string, string>>());
const parameters: Record<string, string[]> = {};
let activeNamespaces: PlaygroundNamespace[] = ["shell"];
let languageRequest = 0;
let pageRequest = 0;

export const playgroundI18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: playgroundLocale.value,
  fallbackLocale: false,
  flatJson: true,
  messages: { en: {}, ru: {} },
  missingWarn: Boolean(import.meta.env?.DEV),
  fallbackWarn: Boolean(import.meta.env?.DEV)
});
const loadCatalog = createCatalogLoader(
  (locale: PlaygroundLocale, namespace: PlaygroundNamespace) => loadPlaygroundCatalogResource(locale, namespace),
  (locale, namespace, resource) => {
    // Save flat keys before Intlify expands the precompiled resource in place.
    const sourceKeys = resource.sourceMessages === true ? Object.keys(resource.default) : [];
    playgroundI18n.global.mergeLocaleMessage(locale, { ...resource.default });
    Object.assign(parameters, resource.parameters);
    // Reuse the AST for copyable source instead of transferring its text twice.
    const sourceMessages = resource.sourceMessages === true
      ? Object.fromEntries(sourceKeys.map((key) => [key,
          playgroundI18n.global.t(key, Object.fromEntries((resource.parameters[key] ?? [])
            .map((name) => [name, "{" + name + "}"])), { locale })
        ]))
      : resource.sourceMessages;
    Object.assign(originals[locale], sourceMessages);
    aliases.set(namespace, resource.aliases);
  }
);

/** Fetch only the requested language/namespaces; failed imports can be retried. */
export async function ensurePlaygroundMessages(namespaces: readonly PlaygroundNamespace[], locale = playgroundLocale.value): Promise<void> {
  await Promise.all(Array.from(new Set(["shell", ...namespaces] as PlaygroundNamespace[]), (namespace) => {
    return loadCatalog(locale, namespace);
  }));
}

/** Keep the previous page visible until all of its replacement's text is ready. */
export async function preparePlaygroundPage(view: string, locale?: PlaygroundLocale): Promise<boolean> {
  const current = ++pageRequest;
  const namespaces = ["shell", ...namespacesForPlaygroundView(view)] as PlaygroundNamespace[];
  let language = locale ?? playgroundI18n.global.locale.value;
  await ensurePlaygroundMessages(namespaces, language);
  if (current !== pageRequest) return false;
  while (locale === undefined && language !== playgroundI18n.global.locale.value) {
    language = playgroundI18n.global.locale.value;
    await ensurePlaygroundMessages(namespaces, language);
  }
  if (current !== pageRequest) return false;
  activeNamespaces = namespaces;
  return true;
}

function commitLocale(locale: PlaygroundLocale): void {
  playgroundI18n.global.locale.value = locale;
  playgroundLocale.value = locale;
  if (typeof document !== "undefined") document.documentElement.lang = locale;
}

export async function setPlaygroundLocale(locale: PlaygroundLocale): Promise<boolean> {
  const current = ++languageRequest;
  await loadActiveNamespaces(locale);
  if (current !== languageRequest) return false;
  commitLocale(locale);
  return true;
}

async function loadActiveNamespaces(locale: PlaygroundLocale): Promise<void> {
  let required: PlaygroundNamespace[];
  do {
    required = activeNamespaces;
    await ensurePlaygroundMessages(required, locale);
  } while (required !== activeNamespaces);
}

// Direct preference refs remain supported; visible translations stay in the
// previous language until the requested resources have finished loading.
watch(playgroundLocale, (value) => {
  if (value === playgroundI18n.global.locale.value) return;
  const current = ++languageRequest;
  void loadActiveNamespaces(value).then(() => {
    if (current === languageRequest && playgroundLocale.value === value) commitLocale(value);
  }).catch(() => { /* Keep the last complete visible locale; a later choice retries. */ });
}, { flush: "sync" });

export function translate(key: string, values: Record<string, string | number> = {}): string {
  const defaults = Object.fromEntries((parameters[key] ?? []).map((name) => [name, "{" + name + "}"]));
  return playgroundI18n.global.t(key, { ...defaults, ...values });
}
export function usePlaygroundI18n() {
  const composer = useI18n({ useScope: "global" });
  return { ...composer, t: translate };
}
export function hasPlaygroundMessage(key: string): boolean {
  return playgroundI18n.global.te(key);
}
export function playgroundTranslationKey(namespace: PlaygroundNamespace, text: string): string | undefined {
  return aliases.get(namespace)?.[catalogTextKey(text)];
}
export function createPlaygroundLocaleUrl(current: URL, locale: PlaygroundLocale): URL {
  const target = new URL(current.href);
  target.searchParams.set("lang", locale);
  return target;
}
/** Literal example copy follows the complete visible locale. */
export function playgroundMessages(): Record<string, string> {
  return originals[playgroundI18n.global.locale.value === "ru" ? "ru" : "en"];
}
