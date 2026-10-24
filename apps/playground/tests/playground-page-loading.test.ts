import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import App from "../src/App.vue";
import { ensurePlaygroundMessages, playgroundI18n, playgroundLocale, setPlaygroundLocale } from "../src/i18n";
import { parsePlaygroundRoute } from "../src/navigation";
import { playgroundThemePreference } from "../src/themes";

const pages = vi.hoisted(() => ({ waits: new Map<string, Promise<void>>() }));
vi.mock("../src/page-loaders", async () => {
  const { defineComponent, h } = await import("vue");
  const views = ["home", "docs", "system", "project", "font", "theme-builder"];
  const modules = Object.fromEntries(views.map((view) => [view, {
    __esModule: true,
    default: defineComponent({ name: "PageFixture", setup: () => () => h("main", { "data-page": view }, view) })
  }]));
  const load = (view: string) => (pages.waits.get(view) ?? Promise.resolve()).then(() => modules[view]);
  return {
    playgroundPageLoaders: Object.fromEntries(views.map((view) => [view, () => load(view)])),
    preloadPlaygroundPage: load
  };
});

const header = defineComponent({
  emits: ["navigate"],
  template: `<nav>
    <button @click="$emit('navigate', 'docs')">Documentation</button>
    <button @click="$emit('navigate', 'project')">Project</button>
  </nav>`
});
let wrapper: VueWrapper | undefined;
let previousLocale = playgroundLocale.value;
let previousTheme = playgroundThemePreference.value;

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
async function openApp(): Promise<VueWrapper> {
  wrapper = mount(App, {
    attachTo: document.body,
    global: {
      plugins: [playgroundI18n],
      stubs: { PlaygroundHeader: header, WlCommandPalette: true, WlToast: true, WlConfirmDialog: true, FontDownloadLink: true }
    }
  });
  await flushPromises();
  return wrapper;
}
async function click(view: string): Promise<void> {
  const button = wrapper!.findAll("nav button").find((item) => item.text() === view)!;
  await button.trigger("click");
  await flushPromises();
}

beforeEach(async () => {
  previousLocale = playgroundLocale.value;
  previousTheme = playgroundThemePreference.value;
  pages.waits.clear();
  await setPlaygroundLocale("en");
  await ensurePlaygroundMessages(["documentation", "examples", "changelog"], "en");
  playgroundThemePreference.value = "gavia";
  window.history.replaceState(null, "", "/?lang=en&theme=gavia");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(async () => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  pages.waits.clear();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
  await setPlaygroundLocale(previousLocale);
  playgroundThemePreference.value = previousTheme;
});

describe("Playground page loading", () => {
  it("keeps the current page and URL until its replacement chunk is ready, with delayed feedback", async () => {
    const app = await openApp();
    const previousUrl = window.location.href;
    vi.useFakeTimers();
    const docs = deferred();
    pages.waits.set("docs", docs.promise);
    await click("Documentation");
    expect(app.find('[data-page="home"]').exists()).toBe(true);
    expect(window.location.href).toBe(previousUrl);
    expect(app.find(".pg-page-loading").exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(150);
    expect(app.get(".pg-page-loading").attributes("role")).toBe("status");
    docs.resolve();
    await flushPromises();
    expect(app.find('[data-page="docs"]').exists()).toBe(true);
    expect(app.find('[data-page="home"]').exists()).toBe(false);
    expect(parsePlaygroundRoute(window.location.search, window.location.hash, window.location.pathname)).toEqual({ view: "docs" });
    expect(app.find(".pg-page-loading").exists()).toBe(false);
  });

  it("retains usable content on a failed import and retries the requested route", async () => {
    const app = await openApp();
    const docs = deferred();
    pages.waits.set("docs", docs.promise);
    await click("Documentation");
    docs.reject(new Error("Offline"));
    await flushPromises();
    expect(app.find('[data-page="home"]').exists()).toBe(true);
    expect(app.get('[role="alert"]').text()).toContain("could not be loaded");
    expect(app.find(".pg-page-loading").exists()).toBe(false);
    pages.waits.delete("docs");
    await app.get('[role="alert"] button').trigger("click");
    await flushPromises();
    expect(app.find('[data-page="docs"]').exists()).toBe(true);
    expect(app.find('[role="alert"]').exists()).toBe(false);
  });

  it("ignores a stale failed request after a newer navigation has succeeded", async () => {
    const app = await openApp();
    const docs = deferred();
    pages.waits.set("docs", docs.promise);
    await click("Documentation");
    await click("Project");
    expect(app.find('[data-page="project"]').exists()).toBe(true);
    docs.reject(new Error("Old request failed"));
    await flushPromises();
    expect(app.find('[data-page="project"]').exists()).toBe(true);
    expect(parsePlaygroundRoute(window.location.search, window.location.hash, window.location.pathname)).toEqual({ view: "project" });
    expect(app.find('[role="alert"]').exists()).toBe(false);
    expect(app.find(".pg-page-loading").exists()).toBe(false);
  });

  it("waits for a cold chunk on Back/Forward while retaining the current page", async () => {
    const app = await openApp();
    const docs = deferred();
    pages.waits.set("docs", docs.promise);
    window.history.replaceState(null, "", "/?view=docs&lang=en&theme=gavia");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await flushPromises();
    expect(app.find('[data-page="home"]').exists()).toBe(true);
    docs.resolve();
    await flushPromises();
    expect(app.find('[data-page="docs"]').exists()).toBe(true);
  });
});
