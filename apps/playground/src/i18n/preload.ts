import type { PlaygroundNamespace } from "./catalog";
import type { PlaygroundLocale } from "./locale";

const loaders = {
  en: {
    shell: () => import("./messages/shell.en.json?compiled"),
    documentation: () => import("./messages/documentation.en.json?compiled"),
    examples: () => import("./messages/examples.en.json?compiled"),
    tokens: () => import("./messages/tokens.en.json?compiled"),
    changelog: () => import("./messages/changelog.en.json?compiled")
  },
  ru: {
    shell: () => import("./messages/shell.ru.json?compiled"),
    documentation: () => import("./messages/documentation.ru.json?compiled"),
    examples: () => import("./messages/examples.ru.json?compiled"),
    tokens: () => import("./messages/tokens.ru.json?compiled"),
    changelog: () => import("./messages/changelog.ru.json?compiled")
  }
};

/** Share fetches before and after bootstrap; installation remains owned by i18n. */
export function createCatalogResourceLoader<Locale extends string, Namespace extends string, Resource>(
  loader: (locale: Locale, namespace: Namespace) => Promise<Resource>
): (locale: Locale, namespace: Namespace) => Promise<Resource> {
  const resources = new Map<string, Promise<Resource>>();
  return (locale, namespace) => {
    const key = locale + ":" + namespace;
    const previous = resources.get(key);
    if (previous) return previous;
    const pending = Promise.resolve().then(() => loader(locale, namespace)).catch((error: unknown) => {
      resources.delete(key);
      throw error;
    });
    resources.set(key, pending);
    return pending;
  };
}

export const loadPlaygroundCatalogResource = createCatalogResourceLoader(
  (locale: PlaygroundLocale, namespace: PlaygroundNamespace) => loaders[locale][namespace]()
);

export function namespacesForPlaygroundView(view: string): PlaygroundNamespace[] {
  if (view === "docs" || view === "system") return ["documentation", "examples", "tokens"];
  if (view === "theme-builder") return ["documentation", "tokens"];
  if (view === "project") return ["changelog"];
  return [];
}

/** Fetch only; never publish a locale, install messages or mount an application. */
export async function preloadPlaygroundCatalogs(view: string, locale: PlaygroundLocale): Promise<void> {
  const namespaces = ["shell", ...namespacesForPlaygroundView(view)] as PlaygroundNamespace[];
  await Promise.all(namespaces.map((namespace) => loadPlaygroundCatalogResource(locale, namespace)));
}
