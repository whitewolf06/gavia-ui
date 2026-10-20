import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { resolveWlTheme, useWlTheme } from "../../src/composables";

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-wl-theme");
});

describe("public theme resolution", () => {
  it("resolves reactive pairs and OS changes without touching DOM for an explicit null target", async () => {
    const media = new EventTarget() as MediaQueryList;
    Object.assign(media, { matches: false });
    const remove = vi.spyOn(media, "removeEventListener");
    vi.stubGlobal("matchMedia", vi.fn(() => media));
    const selection = ref("gavia");
    let api!: ReturnType<typeof useWlTheme>;
    const wrapper = mount(defineComponent({ setup() {
      api = useWlTheme({ themes: () => ({ light: selection.value, dark: "graphite" }), target: () => null });
      return () => h("span", api.theme.value);
    } }));
    expect(wrapper.text()).toBe("gavia");
    expect(document.documentElement.hasAttribute("data-wl-theme")).toBe(false);
    selection.value = "newspaper";
    await nextTick();
    expect(wrapper.text()).toBe("newspaper");
    Object.assign(media, { matches: true });
    media.dispatchEvent(new Event("change"));
    await nextTick();
    expect(wrapper.text()).toBe("graphite");
    expect(document.documentElement.hasAttribute("data-wl-theme")).toBe(false);
    wrapper.unmount();
    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("keeps an explicit theme independent from OS changes", async () => {
    const media = new EventTarget() as MediaQueryList;
    Object.assign(media, { matches: false });
    vi.stubGlobal("matchMedia", () => media);
    const wrapper = mount(defineComponent({ setup() {
      const api = useWlTheme({ themes: () => ({ light: "newspaper", dark: "newspaper" }), target: () => null });
      return () => h("span", api.theme.value);
    } }));
    Object.assign(media, { matches: true });
    media.dispatchEvent(new Event("change"));
    await nextTick();
    expect(wrapper.text()).toBe("newspaper");
    wrapper.unmount();
  });

  it("resolves names during SSR without accessing browser APIs", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    expect(resolveWlTheme("system", { light: "paper", dark: "ink" }, true)).toBe("ink");
    const app = createSSRApp(defineComponent({ setup() {
      const api = useWlTheme({ themes: () => ({ light: "paper", dark: "ink" }), target: () => null });
      return () => h("span", api.theme.value);
    } }));
    expect(await renderToString(app)).toBe("<span>paper</span>");
  });
});
