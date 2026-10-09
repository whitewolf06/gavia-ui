import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, type Plugin } from "vue";
import MediaBehavior from "../../../apps/playground/src/documentation/foundations/examples/MediaBehavior.vue";
import { playgroundI18n } from "../../../apps/playground/src/i18n";

// Playground uses Vue 3.5 and kit tests Vue 3.4. Bridge only their Plugin types;
// the same real plugin is still installed and exercised at runtime.
const playgroundI18nPlugin = playgroundI18n as unknown as Plugin;

let previousLocale = playgroundI18n.global.locale.value;
beforeEach(() => {
  previousLocale = playgroundI18n.global.locale.value;
  playgroundI18n.global.locale.value = "en";
});
afterEach(() => {
  playgroundI18n.global.locale.value = previousLocale;
});
afterEach(() => { vi.unstubAllGlobals(); });
describe("responsive example media lifecycle", () => {
  it("updates the mode, preserves the model and removes its change listener", async () => {
    let listener: (() => void) | undefined;
    const remove = vi.fn();
    const media = { matches: true, addEventListener: vi.fn((type: string, callback: () => void) => { expect(type).toBe("change"); listener = callback; }), removeEventListener: remove };
    const match = vi.fn(() => media);
    vi.stubGlobal("matchMedia", match);
    const wrapper = mount(MediaBehavior, { global: { plugins: [playgroundI18nPlugin] } });
    await nextTick();
    expect(match).toHaveBeenCalledWith("(min-width: 900px)");
    expect(wrapper.text()).toContain("Wide mode");
    await wrapper.get("input").setValue("сохранённый запрос");
    media.matches = false;
    listener!();
    await nextTick();
    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.text()).toContain("сохранённый запрос");
    const toggle = wrapper.get("button");
    expect(toggle.attributes("aria-expanded")).toBe("false");
    await toggle.trigger("click");
    expect(wrapper.get<HTMLInputElement>("input").element.value).toBe("сохранённый запрос");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    wrapper.unmount();
    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith("change", listener);
  });
  it("keeps a focused filter on narrowing and restores focus when its toggle disappears", async () => {
    let listener: (() => void) | undefined;
    const media = { matches: true, addEventListener: (_type: string, callback: () => void) => { listener = callback; }, removeEventListener: vi.fn() };
    vi.stubGlobal("matchMedia", () => media);
    const wrapper = mount(MediaBehavior, { attachTo: document.body, global: { plugins: [playgroundI18nPlugin] } });
    try {
      await nextTick();
      const input = wrapper.get<HTMLInputElement>("input");
      input.element.focus();
      media.matches = false;
      listener!();
      await nextTick();
      expect(wrapper.find("input").exists()).toBe(true);
      expect(document.activeElement).toBe(input.element);
      const button = wrapper.get<HTMLButtonElement>("button");
      expect(button.attributes("aria-expanded")).toBe("true");
      button.element.focus();
      media.matches = true;
      listener!();
      await nextTick();
      expect(wrapper.find("button").exists()).toBe(false);
      expect(document.activeElement).toBe(wrapper.get<HTMLInputElement>("input").element);
    } finally { wrapper.unmount(); }
  });

});
