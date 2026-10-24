import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { GlobalMountOptions } from "../mounting-types";
import { WlConfig } from "../../src";
import { createWlPt, WlInput, WlNumberInput, WlPasswordInput, WlTextarea } from "../../src";

// Wire the kit pt map like a real app, so DataTable sections get wl-* classes.
const global: GlobalMountOptions = {
  plugins: [[WlConfig, { pt: createWlPt() }]]
};
describe("id / aria forwarding to inner elements", () => {
  it("WlInput puts id and aria-* on the inner input, keeps class/style on the wrapper", () => {
    const wrapper = mount(WlInput, {
      global,
      attrs: { id: "f1", "aria-describedby": "f1-desc", class: "extra-class", style: "max-width: 200px" }
    });
    const input = wrapper.find("input");
    expect(input.attributes("id")).toBe("f1");
    expect(input.attributes("aria-describedby")).toBe("f1-desc");
    expect(input.classes()).not.toContain("extra-class");

    const root = wrapper.find('[data-wl="input"]');
    expect(root.attributes("id")).toBeUndefined();
    expect(root.classes()).toContain("extra-class");
    expect(root.attributes("style")).toContain("max-width: 200px");
  });

  it("WlTextarea lands id on the textarea itself", () => {
    const wrapper = mount(WlTextarea, {
      global,
      attrs: { id: "f2", "aria-describedby": "f2-desc" }
    });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("id")).toBe("f2");
    expect(textarea.attributes("aria-describedby")).toBe("f2-desc");
  });

  it("WlPasswordInput forwards id to the inner input", () => {
    const wrapper = mount(WlPasswordInput, {
      global,
      attrs: { id: "f3" }
    });
    expect(wrapper.find("input").attributes("id")).toBe("f3");
    expect(wrapper.find('[data-wl="password-input"]').attributes("id")).toBeUndefined();
  });

  it("WlNumberInput forwards id and aria-label to the inner input", () => {
    const wrapper = mount(WlNumberInput, {
      global,
      attrs: { id: "f4", "aria-label": "Количество" }
    });
    const input = wrapper.find(".wl-stepper__input");
    expect(input.attributes("id")).toBe("f4");
    expect(input.attributes("aria-label")).toBe("Количество");
    expect(wrapper.find('[data-wl="number-input"]').attributes("id")).toBeUndefined();
  });
});
