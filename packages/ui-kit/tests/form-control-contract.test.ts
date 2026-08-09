import { describe, expect, it, vi } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import {
  WlAutocomplete,
  WlCheckbox,
  WlDatePicker,
  WlMultiSelect,
  WlRadio,
  WlSelect,
  WlSwitch,
  createWlPt
} from "../src";

const global: GlobalMountOptions = {
  plugins: [[PrimeVue, { unstyled: true, pt: createWlPt() }]]
};

const sharedAttrs = {
  id: "control-id",
  name: "control-name",
  "aria-label": "Control label",
  "aria-describedby": "control-help",
  class: "consumer-root",
  "data-consumer": "kept"
};

describe("form control native attribute routing", () => {
  it("routes Select attributes and handlers to the focusable combobox", async () => {
    const onFocus = vi.fn();
    const wrapper = mount(WlSelect, {
      global,
      attrs: { ...sharedAttrs, onFocus },
      props: { options: ["One"], modelValue: null }
    });

    const root = wrapper.find('[data-wl="select"]');
    const control = wrapper.find('[role="combobox"]');
    expect(root.classes()).toContain("consumer-root");
    expect(root.attributes("data-consumer")).toBe("kept");
    expect(control.attributes("id")).toBe("control-id");
    expect(control.attributes("aria-label")).toBe("Control label");
    expect(control.attributes("aria-describedby")).toBe("control-help");
    await control.trigger("focus");
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("routes MultiSelect, Autocomplete and DatePicker attrs to their inputs", () => {
    const multi = mount(WlMultiSelect, {
      global,
      attrs: sharedAttrs,
      props: { options: ["One"], modelValue: [] }
    });
    const autocomplete = mount(WlAutocomplete, {
      global,
      attrs: sharedAttrs,
      props: { suggestions: [], modelValue: "" }
    });
    const date = mount(WlDatePicker, {
      global,
      attrs: { ...sharedAttrs, required: true, readonly: true },
      props: { modelValue: null }
    });

    for (const wrapper of [multi, autocomplete, date]) {
      const input = wrapper.find("input");
      expect(input.attributes("id")).toBe("control-id");
      expect(input.attributes("name")).toBe("control-name");
      expect(input.attributes("aria-label")).toBe("Control label");
      expect(input.attributes("aria-describedby")).toBe("control-help");
      expect(wrapper.find(".consumer-root").exists()).toBe(true);
    }
    expect(date.find("input").attributes("required")).toBeDefined();
    expect(date.find("input").attributes("readonly")).toBeDefined();
  });

  it("keeps root attrs on labels and native attrs on binary controls", () => {
    const checkbox = mount(WlCheckbox, {
      global,
      attrs: { ...sharedAttrs, required: true, form: "profile" },
      props: { modelValue: false }
    });
    const radio = mount(WlRadio, {
      global,
      attrs: { ...sharedAttrs, readonly: true },
      props: { value: "one", modelValue: "" }
    });
    const toggle = mount(WlSwitch, {
      global,
      attrs: { ...sharedAttrs, readonly: true },
      props: { modelValue: false, invalid: true }
    });

    for (const wrapper of [checkbox, radio, toggle]) {
      const root = wrapper.find("label");
      const input = wrapper.find("input");
      expect(root.classes()).toContain("consumer-root");
      expect(root.attributes("data-consumer")).toBe("kept");
      expect(input.attributes("id")).toBe("control-id");
      expect(input.attributes("name")).toBe("control-name");
      expect(input.attributes("aria-describedby")).toBe("control-help");
    }
    expect(checkbox.find("input").attributes("required")).toBeDefined();
    expect(checkbox.find("input").attributes("form")).toBe("profile");
    expect(radio.find("input").attributes("readonly")).toBeDefined();
    expect(toggle.find("input").attributes("readonly")).toBeDefined();
    expect(toggle.find(".wl-switch").classes()).toContain("is-invalid");
    expect(toggle.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("lets consumer pt refine routed input attributes", () => {
    const wrapper = mount(WlCheckbox, {
      global,
      attrs: { id: "native-id", "aria-describedby": "native-help" },
      props: {
        modelValue: false,
        pt: { input: { "data-pt": "kept" } }
      }
    });
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("native-id");
    expect(input.attributes("aria-describedby")).toBe("native-help");
    expect(input.attributes("data-pt")).toBe("kept");
  });
});
