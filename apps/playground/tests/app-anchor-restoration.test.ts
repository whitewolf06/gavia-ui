import type { Plugin } from "vue";
import type { Router } from "vue-router";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import App from "../src/App.vue";
import { playgroundI18n, playgroundLocale, setPlaygroundLocale } from "../src/i18n";
import { createPlaygroundRouter } from "../src/router";
import { playgroundThemePreference } from "../src/themes";

// The real DocsPage's metadata/TOC loads normally. Only its async Assets module
// is gated, reproducing a clickable TOC before that child import has completed.
const assets = vi.hoisted(() => {
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { ready, release: () => release() };
});
vi.mock("../src/documentation/assets/DocumentationAssetsPage.vue", async () => {
  await assets.ready;
  const { defineComponent, h } = await import("vue");
  return {
    __esModule: true,
    default: defineComponent({
      name: "DeferredDocumentationAssetsPage",
      props: { section: { type: String, default: undefined } },
      setup: () => () => h("article", h("h2", { id: "docs-icons-catalog" }, "Icon catalog"))
    })
  };
});

const wrappers: VueWrapper[] = [];
const routers: Router[] = [];
const stops: Array<() => void> = [];
const releases: Array<() => void> = [];
const frames = new Map<number, FrameRequestCallback>();
const scroll = vi.fn();
const scrollTop = vi.fn();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let frameNumber = 0;
let previousLocale = playgroundLocale.value;
let previousTheme = playgroundThemePreference.value;
let previousHead = "";

beforeAll(async () => {
  // Warm the page *modules*, not a mounted page or its delayed Assets child.
  // This avoids coupling an App lifecycle assertion to Vite's module transport.
  await Promise.all([import("../src/DocsPage.vue"), import("../src/HomePage.vue"), import("../src/ProjectInfo.vue")]);
});

beforeEach(async () => {
  previousLocale = playgroundLocale.value;
  previousTheme = playgroundThemePreference.value;
  previousHead = document.head.innerHTML;
  await setPlaygroundLocale("en");
  playgroundThemePreference.value = "gavia";
  frameNumber = 0;
  frames.clear();
  scroll.mockClear();
  scrollTop.mockClear();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++frameNumber, callback);
    return frameNumber;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(window, "scrollTo").mockImplementation(scrollTop);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, writable: true, value: scroll });
  // JSDOM has no layout. Model painted/hidden state only, not positions or scroll.
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const rects = this.isConnected && !this.closest("[hidden]") ? [new DOMRect(0, 0, 100, 20)] : [];
    return Object.assign(rects, { item: (index: number) => rects[index] ?? null }) as DOMRectList;
  });
});

afterEach(async () => {
  for (const release of releases.splice(0)) release();
  for (const stop of stops.splice(0)) stop();
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  for (const router of routers.splice(0)) router.options.history.destroy();
  document.body.replaceChildren();
  document.head.innerHTML = previousHead;
  window.history.replaceState(null, "", "/");
  await setPlaygroundLocale(previousLocale);
  playgroundThemePreference.value = previousTheme;
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  frames.clear();
});

async function settleDom(): Promise<void> {
  await flushPromises();
  await nextTick();
  await flushPromises();
}

async function paint(): Promise<void> {
  await settleDom();
  // Honor cancellations by an earlier callback in this same captured frame.
  const queuedFrames = [...frames.keys()];
  for (const id of queuedFrames) {
    const callback = frames.get(id);
    if (!callback) continue;
    frames.delete(id);
    callback(performance.now());
  }
  await settleDom();
}

function holdPreferenceReplace(router: Router) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let held = false;
  const stopBefore = router.beforeEach(async (to) => {
    if (held || to.query.theme !== "gavia") return;
    held = true;
    await gate;
  });
  const finished = new Promise<void>((resolve) => {
    const stopAfter = router.afterEach((to, _from, failure) => {
      if (failure || to.query.theme !== "gavia") return;
      stopAfter();
      resolve();
    });
    stops.push(stopAfter);
  });
  stops.push(stopBefore);
  releases.push(release);
  return { release, finished, wasHeld: () => held };
}

async function mountedApp(url: string, holdInitialPreferences = false) {
  window.history.replaceState(null, "", url);
  const router = createPlaygroundRouter("/");
  if (!router) throw new Error("Expected the real hosted Playground router");
  routers.push(router);
  await router.push(url);
  await router.isReady();
  const preferences = holdInitialPreferences ? holdPreferenceReplace(router) : undefined;
  const historyLengthBeforeMount = history.length;
  const wrapper = mount(App, {
    attachTo: document.body,
    global: {
      plugins: [playgroundI18n as unknown as Plugin, router],
      // Keep App, all five page hooks and Docs' real anchor handler. Only inert
      // shell services are stubbed; no navigation/anchor function is replaced.
      stubs: { PlaygroundHeader: true, WlCommandPalette: true, WlToast: true, WlConfirmDialog: true }
    }
  });
  wrappers.push(wrapper);
  await settleDom(); // deliberately does not execute a captured frame
  return { wrapper, router, preferences, historyLengthBeforeMount };
}

async function historyMove(router: Router, move: () => void): Promise<void> {
  const finished = new Promise<void>((resolve) => {
    const stop = router.afterEach((_to, _from, failure) => {
      if (failure) return;
      stop();
      resolve();
    });
    stops.push(stop);
  });
  move();
  await finished;
  await settleDom();
}

const initialPages = [
  { name: "Home", url: "/#home-project", selector: '[data-testid="home-page"]', id: "home-project", secondId: "home-install-title" },
  { name: "Changelog", url: "/changelog/#project-changelog", selector: '[data-testid="changelog-page"]', id: "project-changelog", secondId: "project-changelog-title" }
];

describe("App-owned page anchor restoration", () => {
  it.each(initialPages)("preserves initial $name anchor through a late preference replace without lang/theme", async (page) => {
    const app = await mountedApp(page.url, true);
    expect(app.wrapper.find(page.selector).exists()).toBe(true);
    expect(app.preferences?.wasHeld()).toBe(true);
    expect(new URL(window.location.href).searchParams.has("theme")).toBe(false);
    // Leave any early anchor frame queued, then commit the asynchronous replace.
    // A prematurely captured exact href is now stale, rather than silently valid.
    app.preferences!.release();
    await app.preferences!.finished;
    await paint();
    const target = app.wrapper.get("#" + page.id).element;
    expect(scroll.mock.instances).toEqual([target]);
    expect(window.location.hash).toBe("#" + page.id);
    expect(new URL(window.location.href).searchParams.get("theme")).toBe("gavia");
    expect(history.length).toBe(app.historyLengthBeforeMount); // preference replace
    target.append(document.createTextNode(" rerender"));
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it.each(initialPages)("restores $name on same-page Back and Forward without remounting its hook", async (page) => {
    const app = await mountedApp(page.url);
    await paint();
    const first = app.wrapper.get("#" + page.id).element;
    const second = app.wrapper.get("#" + page.secondId).element;
    expect(scroll.mock.instances).toEqual([first]);
    const bookmarked = window.location.href;
    await app.router.push({ path: app.router.currentRoute.value.path, query: app.router.currentRoute.value.query, hash: "#" + page.secondId });
    await paint();
    expect(app.wrapper.get("#" + page.id).element).toBe(first);
    expect(scroll.mock.instances).toEqual([first, second]);
    const secondBookmark = window.location.href;
    const historyLength = history.length;
    scroll.mockClear();
    await historyMove(app.router, () => app.router.back());
    await paint();
    expect(window.location.href).toBe(bookmarked);
    expect(app.wrapper.get("#" + page.id).element).toBe(first);
    expect(scroll.mock.instances).toEqual([first]);
    await historyMove(app.router, () => app.router.forward());
    await paint();
    expect(window.location.href).toBe(secondBookmark);
    expect(app.wrapper.get("#" + page.secondId).element).toBe(second);
    expect(scroll.mock.instances).toEqual([first, second]);
    expect(history.length).toBe(historyLength); // restores never add history
  });

  it("restores an explicit TOC anchor whose async child appears after App mounted and the first request frame", async () => {
    releases.push(assets.release); // also release a held import if an assertion fails
    const app = await mountedApp("/docs/?theme=gavia");
    await paint();
    expect(app.wrapper.find('[data-testid="docs-page"]').exists()).toBe(true);
    expect(window.location.hash).toBe("");
    await app.router.push("/docs/icons/?theme=gavia");
    await paint();
    scroll.mockClear();
    scrollTop.mockClear();
    const toc = app.wrapper.get('.docs-sidebar a[href="#docs-icons-catalog"]');
    await toc.trigger("click");
    await paint(); // request's first frame definitely runs before child resolves
    expect(document.getElementById("docs-icons-catalog")).toBeNull();
    expect(window.location.hash).toBe("#docs-icons-catalog");
    const topCallsWhileTargetMissing = scrollTop.mock.calls.length;
    const href = window.location.href;
    const historyLength = history.length;
    assets.release();
    await settleDom();
    const target = app.wrapper.get("#docs-icons-catalog").element;
    await paint();
    expect(scroll.mock.instances).toEqual([target]);
    expect(topCallsWhileTargetMissing).toBe(0);
    expect(scrollTop).not.toHaveBeenCalled();
    expect(window.location.href).toBe(href);
    expect(history.length).toBe(historyLength);
    target.classList.add("render-after-restoration");
    await paint();
    expect(scroll).toHaveBeenCalledTimes(1);
  });
});

describe("Initial preferences after history traversal during startup", () => {
  it.each([
    { name: "Russian system visit", staleLocale: "en", url: "/ru/docs/?theme=system#docs-components", path: "/ru/docs/", language: "ru", preference: "system", theme: "gavia" },
    { name: "Russian explicit dark visit", staleLocale: "en", url: "/ru/docs/?theme=graphite#docs-components", path: "/ru/docs/", language: "ru", preference: "graphite", theme: "graphite" },
    { name: "unprefixed English path", staleLocale: "ru", url: "/docs/?theme=graphite#docs-components", path: "/docs/", language: "en", preference: "graphite", theme: "graphite" },
    { name: "legacy Russian query", staleLocale: "en", url: "/?view=docs&lang=ru&theme=graphite#docs-components", path: "/ru/docs/", language: "ru", preference: "graphite", theme: "graphite" },
    { name: "query language overriding Russian path", staleLocale: "ru", url: "/ru/docs/?view=docs&lang=en&theme=system#docs-components", path: "/docs/", language: "en", preference: "system", theme: "gavia" }
  ] as const)("honours the current $name instead of pre-traversal preference refs", async (visit) => {
    // Model modules having resolved preferences for the document being reloaded.
    // Delay mounting, then traverse the real history before App can pin a visit.
    await setPlaygroundLocale(visit.staleLocale);
    playgroundThemePreference.value = "graphite";
    const oldDocument = (visit.staleLocale === "ru" ? "/ru/docs/" : "/docs/") + "?theme=graphite#reload-visit";
    window.history.replaceState(null, "", visit.url);
    window.history.pushState(null, "", oldDocument);
    let release!: () => void;
    const startup = new Promise<void>((resolve) => {
      release = resolve;
    });
    releases.push(release);
    const pendingApp = startup.then(() => mountedApp(window.location.pathname + window.location.search + window.location.hash));
    const traversed = new Promise<void>((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
    });
    window.history.back();
    await traversed;
    expect(window.location.href).toBe(new URL(visit.url, window.location.origin).href);
    expect(playgroundLocale.value).toBe(visit.staleLocale);
    expect(document.querySelector(".pg-top")).toBeNull();
    release();
    const app = await pendingApp;
    await vi.waitFor(() => {
      expect(document.documentElement.lang).toBe(visit.language);
      expect(document.documentElement.dataset.wlTheme).toBe(visit.theme);
      const current = new URL(window.location.href);
      expect(current.pathname).toBe(visit.path);
      expect(current.searchParams.get("theme")).toBe(visit.preference);
      expect(current.hash).toBe("#docs-components");
      expect(app.wrapper.find('[data-testid="docs-page"]').exists()).toBe(true);
    });
    expect(history.length).toBe(app.historyLengthBeforeMount);
  });

  it("still pins a preference-free initial visit from detected automatic preferences", async () => {
    const previousSavedLocale = localStorage.getItem("gavia-ui.locale");
    const previousSavedTheme = localStorage.getItem("gavia-ui.theme");
    localStorage.removeItem("gavia-ui.locale");
    localStorage.removeItem("gavia-ui.theme");
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["ru-RU"]);
    vi.spyOn(navigator, "language", "get").mockReturnValue("ru-RU");
    await setPlaygroundLocale("ru");
    playgroundThemePreference.value = "system";
    try {
      const app = await mountedApp("/");
      await vi.waitFor(() => {
        expect(document.documentElement.lang).toBe("ru");
        expect(document.documentElement.dataset.wlTheme).toBe("gavia");
        expect(window.location.pathname).toBe("/ru/");
        expect(new URL(window.location.href).searchParams.get("theme")).toBe("system");
      });
      expect(history.length).toBe(app.historyLengthBeforeMount);
      expect(localStorage.getItem("gavia-ui.locale")).toBeNull();
      expect(localStorage.getItem("gavia-ui.theme")).toBeNull();
    } finally {
      if (previousSavedLocale === null) localStorage.removeItem("gavia-ui.locale");
      else localStorage.setItem("gavia-ui.locale", previousSavedLocale);
      if (previousSavedTheme === null) localStorage.removeItem("gavia-ui.theme");
      else localStorage.setItem("gavia-ui.theme", previousSavedTheme);
    }
  });
});
