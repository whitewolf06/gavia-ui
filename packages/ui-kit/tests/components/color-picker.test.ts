import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { WlColorPicker } from "../../src";

// Own components need no PrimeVue sections; the plugin is added for repo-wide consistency.
const global: GlobalMountOptions = {
  plugins: [[WlConfig]]
};
describe("WlColorPicker", () => {
  it("emits normalized lowercase hex when a swatch is clicked", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { swatches: ["#FFF", "#2E9E68"] }
    });
    const swatches = wrapper.findAll(".wl-color-picker__sw");
    expect(swatches).toHaveLength(2);

    await swatches[0]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["#ffffff"]);

    await swatches[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")![1]).toEqual(["#2e9e68"]);
  });

  it("emits valid hex input normalized and flags invalid input without emitting", async () => {
    const wrapper = mount(WlColorPicker, { global });
    const input = wrapper.find(".wl-color-picker__hex");

    await input.setValue("#abc");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["#aabbcc"]);
    expect(input.classes()).not.toContain("is-invalid");

    const before = wrapper.emitted("update:modelValue")!.length;
    await input.setValue("#12345");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(before);
    expect(input.classes()).toContain("is-invalid");
    expect(input.attributes("aria-invalid")).toBe("true");

    await input.setValue("#A1B2C3");
    const emitted = wrapper.emitted("update:modelValue")!;
    expect(emitted[emitted.length - 1]).toEqual(["#a1b2c3"]);
    expect(input.classes()).not.toContain("is-invalid");
  });

  it("marks the swatch matching modelValue with the selected ring class", () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { modelValue: "#2E9E68" } // uppercase on purpose: match is normalized
    });
    const selected = wrapper.findAll(".wl-color-picker__sw.is-selected");
    expect(selected).toHaveLength(1);
    expect(selected[0]!.attributes("aria-label")).toBe("#2e9e68");
    expect(selected[0]!.attributes("aria-selected")).toBe("true");
  });

  it("renders the default kit palette and supports size sm", () => {
    const wrapper = mount(WlColorPicker, { global, props: { size: "sm" } });
    expect(wrapper.findAll(".wl-color-picker__sw").length).toBeGreaterThanOrEqual(12);
    expect(wrapper.find('[data-wl="color-picker"]').attributes("data-size")).toBe("sm");
  });

  it("supports external invalid and a fully disabled state", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      props: { modelValue: "#2563eb", invalid: true, disabled: true }
    });
    const root = wrapper.find('[data-wl="color-picker"]');
    const input = wrapper.find("input");
    const swatch = wrapper.find(".wl-color-picker__sw");
    expect(root.attributes("data-disabled")).toBe("true");
    expect(root.attributes("data-invalid")).toBe("true");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(swatch.attributes("disabled")).toBeDefined();
    await swatch.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("uses roving focus and arrow navigation for swatches", async () => {
    const wrapper = mount(WlColorPicker, {
      global,
      attachTo: document.body,
      props: { swatches: ["#111111", "#222222", "#333333"] }
    });
    const swatches = wrapper.findAll(".wl-color-picker__sw");
    expect(swatches.map((swatch) => swatch.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
    (swatches[0]!.element as HTMLButtonElement).focus();
    await swatches[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(swatches[1]!.element);
    expect(swatches[1]!.attributes("tabindex")).toBe("0");
    await swatches[1]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(swatches[2]!.element);
    wrapper.unmount();
  });

  it("clears an invalid draft without emitting and accepts the next valid swatch", async () => {
    const wrapper = mount(WlColorPicker, { global, props: { modelValue: "#112233", swatches: ["not-a-color", "#abc"] } });
    try {
      const input = wrapper.get<HTMLInputElement>(".wl-color-picker__hex");
      await input.setValue("#12");
      expect(input.attributes("aria-invalid")).toBe("true");
      await input.setValue("   ");
      expect(input.classes()).not.toContain("is-invalid");
      expect(input.attributes("aria-invalid")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.findAll(".wl-color-picker__sw")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.findAll(".wl-color-picker__sw")[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")).toEqual([["#aabbcc"]]);
      expect(input.element.value).toBe("#aabbcc");
    } finally {
      wrapper.unmount();
    }
  });

  it("wraps swatch keyboard navigation and keeps one tab stop after the palette shrinks", async () => {
    const wrapper = mount(WlColorPicker, {
      global, attachTo: document.body,
      props: { modelValue: "#333333", swatches: ["#111111", "#222222", "#333333"] }
    });
    try {
      const swatches = wrapper.findAll(".wl-color-picker__sw");
      expect(swatches[2]!.attributes("tabindex")).toBe("0");
      (swatches[2]!.element as HTMLButtonElement).focus();
      await swatches[2]!.trigger("keydown", { key: "ArrowDown" });
      expect(document.activeElement).toBe(swatches[0]!.element);
      await swatches[0]!.trigger("keydown", { key: "ArrowLeft" });
      expect(document.activeElement).toBe(swatches[2]!.element);
      await swatches[2]!.trigger("keydown", { key: "ArrowUp" });
      expect(document.activeElement).toBe(swatches[1]!.element);
      await swatches[1]!.trigger("keydown", { key: "Home" });
      expect(document.activeElement).toBe(swatches[0]!.element);
      const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      swatches[0]!.element.dispatchEvent(tab);
      expect(tab.defaultPrevented).toBe(false);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await swatches[0]!.trigger("keydown", { key: "End" });
      await wrapper.setProps({ swatches: ["#111111", "#222222"] });
      expect(wrapper.findAll('.wl-color-picker__sw[tabindex="0"]')).toHaveLength(1);
      expect(wrapper.get('.wl-color-picker__sw[tabindex="0"]').attributes("aria-label")).toBe("#222222");
      await wrapper.setProps({ swatches: [] });
      expect(wrapper.findAll(".wl-color-picker__sw")).toHaveLength(0);
      expect(wrapper.find("input").exists()).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });
});
