import type * as Vue from "vue";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const startup = vi.hoisted(() => {
  const app = {
    use: vi.fn(), mount: vi.fn(), unmount: vi.fn(),
    runWithContext: <Value>(callback: () => Value) => callback()
  };
  app.use.mockReturnValue(app);
  return {
    app,
    createApp: vi.fn(() => app),
    preload: vi.fn<(view: string) => Promise<unknown>>(),
    messages: vi.fn<(view: string) => Promise<boolean>>(),
    router: { isReady: vi.fn(async () => {}) }
  };
});
vi.mock("vue", async (original) => ({ ...await original<typeof Vue>(), createApp: startup.createApp, watch: vi.fn() }));
vi.mock("gavia-ui", () => ({
  createWlPt: () => ({}), useWlConfig: () => ({ setLocale: vi.fn() }),
  WlConfig: {}, WlConfirmationService: {}, WlToastService: {}, wlLocaleEn: {}, wlLocaleRu: {}
}));
vi.mock("../src/App.vue", () => ({ default: {} }));
vi.mock("../src/page-loaders", () => ({ preloadPlaygroundPage: startup.preload }));
vi.mock("../src/i18n", () => ({ playgroundI18n: {}, playgroundLocale: { value: "ru" }, preparePlaygroundPage: startup.messages, ensurePlaygroundMessages: async () => {} }));
vi.mock("../src/router", () => ({ createPlaygroundRouter: () => startup.router }));

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  startup.preload.mockReset();
  startup.messages.mockReset();
  document.body.innerHTML = '<div id="app"><p>Static fallback</p></div>';
  window.history.replaceState(null, "", "/ru/docs/components/WlSelect/?theme=white");
});
afterEach(() => {
  delete document.documentElement.dataset.wlBoot;
  document.documentElement.removeAttribute("data-playground-prerendered");
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("initial page preparation", () => {
  it("keeps prerendered route content outside the startup screen until mounting", async () => {
    const page = deferred<unknown>();
    const messages = deferred<boolean>();
    startup.preload.mockReturnValue(page.promise);
    startup.messages.mockReturnValue(messages.promise);
    document.documentElement.setAttribute("data-playground-prerendered", "");
    document.getElementById("app")!.innerHTML = "<main><h1>WlSelect</h1></main>";
    await import("../src/bootstrap");
    expect(document.documentElement.dataset.wlBoot).toBeUndefined();
    expect(document.querySelector("h1")?.textContent).toBe("WlSelect");
    expect(startup.app.mount).not.toHaveBeenCalled();
    page.resolve({ default: {} });
    messages.resolve(true);
    await flushPromises();
    expect(startup.app.mount).toHaveBeenCalledExactlyOnceWith("#app");
    expect(document.documentElement.hasAttribute("data-playground-prerendered")).toBe(false);
  });

  it.each(["page", "messages"])("starts route and catalogs together and retains fallback until both finish (%s first)", async (first) => {
    const page = deferred<unknown>();
    const messages = deferred<boolean>();
    startup.preload.mockReturnValue(page.promise);
    startup.messages.mockReturnValue(messages.promise);
    await import("../src/bootstrap");
    expect(startup.preload).toHaveBeenCalledExactlyOnceWith("docs");
    expect(startup.messages).toHaveBeenCalledExactlyOnceWith("docs");
    expect(startup.createApp).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.wlBoot).toBe("loading");
    if (first === "page") page.resolve({ default: {} });
    else messages.resolve(true);
    await flushPromises();
    expect(startup.createApp).not.toHaveBeenCalled();
    expect(document.getElementById("app")?.textContent).toBe("Static fallback");
    if (first === "page") messages.resolve(true);
    else page.resolve({ default: {} });
    await flushPromises();
    expect(startup.app.mount).toHaveBeenCalledExactlyOnceWith("#app");
    expect(document.documentElement.dataset.wlBoot).toBeUndefined();
  });

  it("routes failed initial imports through the existing retry UI before mounting", async () => {
    startup.preload.mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce({ default: {} });
    startup.messages.mockResolvedValue(true);
    await import("../src/bootstrap");
    await flushPromises();
    expect(startup.app.mount).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.wlBoot).toBe("error");
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("Не удалось загрузить содержимое");
    document.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await flushPromises();
    expect(startup.preload).toHaveBeenCalledTimes(2);
    expect(startup.app.mount).toHaveBeenCalledExactlyOnceWith("#app");
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });
});
