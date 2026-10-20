import type * as UiModule from "gavia-ui";
import type * as VueModule from "vue";
import type { App, Ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const startup = vi.hoisted(() => ({
  apps: [] as App[],
  mounted: new Set<App>(),
  locale: undefined as Ref<"en" | "ru"> | undefined,
  setLocale: vi.fn(),
  failMount: false
}));

vi.mock("vue", async (original) => {
  const vue = await original<typeof VueModule>();
  return {
    ...vue,
    createApp: (...args: Parameters<typeof vue.createApp>) => {
      const app = vue.createApp(...args);
      startup.apps.push(app);
      const mount = app.mount.bind(app);
      app.mount = (...mountArgs) => {
        if (startup.failMount) throw new Error("Mount failed");
        const instance = mount(...mountArgs);
        startup.mounted.add(app);
        return instance;
      };
      const unmount = app.unmount.bind(app);
      app.unmount = () => {
        if (startup.mounted.delete(app)) unmount();
      };
      return app;
    }
  };
});
vi.mock("gavia-ui", async (original) => {
  const ui = await original<typeof UiModule>();
  return {
    ...ui,
    useWlConfig: () => {
      const configuration = ui.useWlConfig();
      return {
        ...configuration,
        setLocale: (...args: Parameters<typeof configuration.setLocale>) => {
          startup.setLocale(...args);
          configuration.setLocale(...args);
        }
      };
    }
  };
});
vi.mock("../src/App.vue", async () => {
  const { h } = await import("vue");
  const { WlSpinner } = await import("gavia-ui");
  return { default: { render: () => h(WlSpinner) } };
});
vi.mock("../src/page-loaders", () => ({ preloadPlaygroundPage: async () => ({}) }));
vi.mock("../src/router", () => ({ createPlaygroundRouter: () => undefined }));
vi.mock("../src/i18n", async () => {
  const { ref } = await import("vue");
  startup.locale = ref<"en" | "ru">("en");
  return {
    playgroundI18n: { install: () => {} },
    playgroundLocale: startup.locale,
    preparePlaygroundPage: async () => true,
    ensurePlaygroundMessages: async () => {}
  };
});

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  startup.apps.length = 0;
  startup.failMount = false;
  await import("../src/i18n");
  startup.locale!.value = "en";
  document.body.innerHTML = '<div id="app"></div><div id="other-app"></div>';
  window.history.replaceState(null, "", "/docs/");
});
afterEach(() => {
  for (const app of startup.apps) app.unmount();
  document.body.replaceChildren();
  window.history.replaceState(null, "", "/");
});

describe("bootstrap configuration integration", () => {
  it("updates the installed app through the public API, isolates other apps and stops syncing on unmount", async () => {
    await import("../src/bootstrap");
    await flushPromises();
    const { createApp, h, nextTick } = await import("vue");
    const { WlConfig, wlLocaleEn, wlLocaleRu, WlSpinner } = await import("gavia-ui");
    const app = startup.apps[0]!;
    const other = createApp({ render: () => h(WlSpinner) });
    other.use(WlConfig, { locale: wlLocaleEn });
    other.mount("#other-app");
    expect(document.querySelector('#app [role="status"]')?.getAttribute("aria-label")).toBe(wlLocaleEn.loading);

    startup.locale!.value = "ru";
    await nextTick();
    expect(startup.setLocale).toHaveBeenCalledExactlyOnceWith(wlLocaleRu);
    expect(document.querySelector('#app [role="status"]')?.getAttribute("aria-label")).toBe(wlLocaleRu.loading);
    expect(document.querySelector('#other-app [role="status"]')?.getAttribute("aria-label")).toBe(wlLocaleEn.loading);

    app.unmount();
    startup.setLocale.mockClear();
    startup.locale!.value = "en";
    await nextTick();
    expect(startup.setLocale).not.toHaveBeenCalled();
  });

  it("disposes locale synchronization when mounting fails before retry UI is shown", async () => {
    startup.failMount = true;
    await import("../src/bootstrap");
    await flushPromises();
    expect(document.querySelector('[role="alert"]')).not.toBeNull();

    const { nextTick } = await import("vue");
    startup.locale!.value = "ru";
    await nextTick();
    expect(startup.setLocale).not.toHaveBeenCalled();
  });
});
