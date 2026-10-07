import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import MediaBehavior from "../../../apps/playground/src/documentation/foundations/examples/MediaBehavior.vue";
afterEach(() => { vi.unstubAllGlobals(); });
describe("responsive example media lifecycle", () => {
  it("updates the mode, preserves the model and removes its change listener", async () => {
    let listener: (() => void) | undefined;
    const remove = vi.fn();
    const media = { matches: true, addEventListener: vi.fn((type: string, callback: () => void) => { expect(type).toBe("change"); listener = callback; }), removeEventListener: remove };
    const match = vi.fn(() => media);
    vi.stubGlobal("matchMedia", match);
    const wrapper = mount(MediaBehavior);
    await nextTick();
    expect(match).toHaveBeenCalledWith("(min-width: 900px)");
    expect(wrapper.text()).toContain("Широкий режим");
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
    const wrapper = mount(MediaBehavior, { attachTo: document.body });
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
