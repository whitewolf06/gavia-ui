import type { GlobalMountOptions } from "./mounting-types";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { WlConfig } from "../src";
import { WlCheckbox, createWlPt } from "../src";
import { nextTick } from "vue";

const global: GlobalMountOptions = { plugins: [[WlConfig]] };

describe("WlCheckbox", () => {
  it("toggles the binary model", async () => {
    const wrapper = mount(WlCheckbox, { global, props: { modelValue: false } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(true);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
  });

  it("toggles back off", async () => {
    const wrapper = mount(WlCheckbox, { global, props: { modelValue: true } });
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(false);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
  });

  it("applies indeterminate state class", () => {
    const wrapper = mount(WlCheckbox, { global, props: { indeterminate: true } });
    expect(wrapper.find(".wl-checkbox").classes()).toContain("is-indeterminate");
  });

  it("renders label slot", () => {
    const wrapper = mount(WlCheckbox, { global, slots: { default: "Согласен с условиями" } });
    expect(wrapper.find('[data-wl="checkbox"]').text()).toContain("Согласен с условиями");
  });

  it("keeps the native mixed state and mark in sync across controlled updates", async () => {
    const wrapper = mount(WlCheckbox, { global, props: { modelValue: false, indeterminate: true } });
    const input = wrapper.get("input").element as HTMLInputElement;
    const mixedPath = wrapper.get("svg.wl-checkbox__icon path").attributes("d");
    expect(input.checked).toBe(false);
    expect(input.indeterminate).toBe(true);
    expect(wrapper.get(".wl-checkbox__box").classes()).toContain("is-indeterminate");
    expect(wrapper.get("svg.wl-checkbox__icon").attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({ modelValue: true, indeterminate: false });
    expect(input.checked).toBe(true);
    expect(input.indeterminate).toBe(false);
    expect(wrapper.get(".wl-checkbox__box").classes()).toContain("is-checked");
    expect(wrapper.get(".wl-checkbox__box").classes()).not.toContain("is-indeterminate");
    expect(wrapper.get("svg.wl-checkbox__icon path").attributes("d")).not.toBe(mixedPath);

    await wrapper.setProps({ modelValue: false });
    expect(input.checked).toBe(false);
    expect(wrapper.find(".wl-checkbox__icon").exists()).toBe(false);
    expect(wrapper.get(".wl-checkbox__box").classes()).not.toContain("is-checked");

    await wrapper.setProps({ modelValue: true, indeterminate: true });
    expect(input.indeterminate).toBe(true);
    expect(wrapper.get("svg.wl-checkbox__icon path").attributes("d")).toBe(mixedPath);
    wrapper.unmount();
  });

  it.each([false, true])("preserves a disabled model %s on native label activation", async (modelValue) => {
    const host = document.createElement("div");
    document.body.append(host);
    const wrapper = mount(WlCheckbox, {
      attachTo: host,
      global,
      props: { modelValue, disabled: true },
      slots: { default: "Notifications" }
    });
    try {
      const input = wrapper.get("input").element as HTMLInputElement;
      (wrapper.get("label").element as HTMLLabelElement).click();
      await nextTick();
      expect(input.disabled).toBe(true);
      expect(input.checked).toBe(modelValue);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();

      await wrapper.setProps({ disabled: false });
      (wrapper.get("label").element as HTMLLabelElement).click();
      await nextTick();
      expect(wrapper.emitted("update:modelValue")).toEqual([[!modelValue]]);
      await wrapper.setProps({ modelValue: !modelValue });
      expect(wrapper.find(".wl-checkbox__icon").exists()).toBe(!modelValue);
    } finally {
      wrapper.unmount();
      host.remove();
    }
  });

  it("merges documented icon pt defaults, app attributes and local attributes for both marks", async () => {
    const wrapper = mount(WlCheckbox, {
      global: {
        plugins: [[WlConfig, { pt: createWlPt({
          checkbox: { icon: { class: "app-mark", "data-app": "kept", "data-source": "app" } }
        }) }]]
      },
      props: {
        modelValue: true,
        pt: { icon: { class: "local-mark", "data-source": "local" } }
      }
    });
    function checkIcon(): void {
      const icon = wrapper.get("svg.wl-checkbox__icon");
      expect(icon.classes()).toContain("app-mark");
      expect(icon.classes()).toContain("local-mark");
      expect(icon.attributes("data-app")).toBe("kept");
      expect(icon.attributes("data-source")).toBe("local");
      expect(icon.attributes("aria-hidden")).toBe("true");
    }
    checkIcon();
    await wrapper.setProps({ indeterminate: true });
    checkIcon();
    wrapper.unmount();
  });
});
