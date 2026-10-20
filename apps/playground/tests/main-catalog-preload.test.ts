import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type * as CatalogPreload from "../src/i18n/preload";

const startup = vi.hoisted(() => ({
  catalogRequests: [] as { view: string; locale: string }[],
  pages: [] as string[],
  bootstrapStarted: false,
  catalogGate: Promise.resolve(),
  bootstrapGate: Promise.resolve(),
  pageGate: Promise.resolve<unknown>({}),
  releaseCatalogs: () => {},
  releaseBootstrap: () => {},
  releasePage: () => {}
}));

vi.mock("../src/i18n/preload", async (original) => ({
  ...await original<typeof CatalogPreload>(),
  preloadPlaygroundCatalogs: (view: string, locale: string) => {
    startup.catalogRequests.push({ view, locale });
    return startup.catalogGate;
  }
}));
vi.mock("../src/bootstrap", async () => {
  startup.bootstrapStarted = true;
  await startup.bootstrapGate;
  return {};
});
vi.mock("../src/page-loaders", () => ({ preloadPlaygroundPage: (view: string) => {
  startup.pages.push(view);
  return startup.pageGate;
} }));

beforeEach(() => {
  vi.resetModules();
  startup.catalogRequests.length = 0;
  startup.pages.length = 0;
  startup.bootstrapStarted = false;
  startup.catalogGate = new Promise<void>((resolve) => {
    startup.releaseCatalogs = resolve;
  });
  startup.bootstrapGate = new Promise<void>((resolve) => {
    startup.releaseBootstrap = resolve;
  });
  startup.pageGate = new Promise<unknown>((resolve) => {
    startup.releasePage = () => resolve({});
  });
  window.localStorage.setItem("gavia-ui.locale", "en");
  window.history.replaceState(null, "", "/?view=system&theme=gavia&lang=ru");
  document.documentElement.lang = "en";
  document.body.innerHTML = '<div id="app">Static fallback</div>';
});

afterEach(async () => {
  startup.releaseCatalogs();
  startup.releasePage();
  startup.releaseBootstrap();
  await flushPromises();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  document.body.replaceChildren();
});

it("starts catalog preparation while page and bootstrap module imports are still blocked", async () => {
  const initialUrl = window.location.href;
  expect(startup.catalogRequests).toEqual([]);
  await import("../src/main");
  await flushPromises();
  expect(startup.bootstrapStarted).toBe(true);
  expect(startup.pages).toEqual(["system"]);
  expect(startup.catalogRequests).toEqual([{ view: "system", locale: "ru" }]);
  expect(document.getElementById("app")?.textContent).toBe("Static fallback");
  expect(document.documentElement.lang).toBe("en");
  expect(window.localStorage.getItem("gavia-ui.locale")).toBe("en");
  expect(window.location.href).toBe(initialUrl);
});
