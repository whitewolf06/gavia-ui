import type { PlaygroundView } from "./navigation";

/** Share preloading and Vue's async component request; allow failed imports to retry. */
export function createPlaygroundPageLoader<Page>(load: () => Promise<Page>): () => Promise<Page> {
  let pending: Promise<Page> | undefined;
  return () => {
    pending ??= Promise.resolve().then(load).catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}

const docs = createPlaygroundPageLoader(() => import("./DocsPage.vue"));
export const playgroundPageLoaders = {
  home: createPlaygroundPageLoader(() => import("./HomePage.vue")),
  docs,
  components: docs,
  system: createPlaygroundPageLoader(() => import("./DesignSystem.vue")),
  project: createPlaygroundPageLoader(() => import("./ProjectInfo.vue")),
  "theme-builder": createPlaygroundPageLoader(() => import("./ThemeBuilderPage.vue")),
  font: createPlaygroundPageLoader(() => import("./type-study/GaviaTypeStudy.vue"))
};

/** Start only the requested route; unrelated galleries and pages stay lazy. */
export function preloadPlaygroundPage(view: PlaygroundView) {
  return playgroundPageLoaders[view]();
}
