import { describe, it, expect } from "vitest";
import { mount, type GlobalMountOptions } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { WlInput, WlNumberInput, WlPasswordInput } from "../src";

const global: GlobalMountOptions = { plugins: [[PrimeVue, { unstyled: true }]] };

describe("WlInput", () => {
  it("updates v-model on typing", async () => {
    const wrapper = mount(WlInput, { global, props: { modelValue: "" } });
    const input = wrapper.find("input");
    await input.setValue("Название задачи");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Название задачи"]);
  });

  it("applies invalid class", () => {
    const wrapper = mount(WlInput, { global, props: { invalid: true } });
    expect(wrapper.find("input").classes()).toContain("is-invalid");
  });

  it("applies size class and data-size on the root", () => {
    const wrapper = mount(WlInput, { global, props: { size: "sm" } });
    expect(wrapper.find("input").classes()).toContain("wl-input--sm");
    const root = wrapper.find('[data-wl="input"]');
    expect(root.attributes("data-size")).toBe("sm");
  });

  it("renders prefix and suffix slots", () => {
    const wrapper = mount(WlInput, {
      global,
      slots: { prefix: "<b class='pfx' />", suffix: "<b class='sfx' />" }
    });
    expect(wrapper.find(".wl-input-wrap--has-prefix").exists()).toBe(true);
    expect(wrapper.find(".wl-input-wrap--has-suffix").exists()).toBe(true);
    expect(wrapper.find(".pfx").exists()).toBe(true);
    expect(wrapper.find(".sfx").exists()).toBe(true);
  });

  it("applies disabled state", () => {
    const wrapper = mount(WlInput, { global, props: { disabled: true } });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.classes()).toContain("is-disabled");
  });

  it("forwards native form attributes and listeners to the actual input", async () => {
    let focused = false;
    const wrapper = mount(WlInput, {
      global,
      attrs: {
        class: "consumer-root",
        name: "title",
        autocomplete: "off",
        required: true,
        maxlength: 80,
        list: "task-titles",
        autocapitalize: "sentences",
        min: 1,
        max: 120,
        step: 1,
        onFocus: () => {
          focused = true;
        }
      }
    });

    const root = wrapper.find('[data-wl="input"]');
    const input = wrapper.find("input");
    expect(root.classes()).toContain("consumer-root");
    expect(root.attributes("name")).toBeUndefined();
    expect(input.attributes("name")).toBe("title");
    expect(input.attributes("autocomplete")).toBe("off");
    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("maxlength")).toBe("80");
    expect(input.attributes("list")).toBe("task-titles");
    expect(input.attributes("autocapitalize")).toBe("sentences");
    expect(input.attributes("min")).toBe("1");
    expect(input.attributes("max")).toBe("120");
    expect(input.attributes("step")).toBe("1");
    expect(root.attributes("list")).toBeUndefined();
    await input.trigger("focus");
    expect(focused).toBe(true);
  });

  it("keeps the same native attribute routing for password and number inputs", () => {
    const password = mount(WlPasswordInput, {
      global,
      attrs: { name: "password", autocomplete: "current-password", required: true }
    });
    const number = mount(WlNumberInput, {
      global,
      attrs: { name: "estimate", form: "task-form", inputmode: "decimal" }
    });

    expect(password.find("input").attributes("name")).toBe("password");
    expect(password.find("input").attributes("autocomplete")).toBe("current-password");
    expect(password.find("input").attributes("required")).toBeDefined();
    expect(number.find("input").attributes("name")).toBe("estimate");
    expect(number.find("input").attributes("form")).toBe("task-form");
    expect(number.find("input").attributes("inputmode")).toBe("decimal");
  });
});
