import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";

const components = [
  { name: "Select", component: WlSelect<string>, props: { options: ["One", "Two"] } },
  { name: "MultiSelect", component: WlMultiSelect<string>, props: { options: ["One", "Two"] } },
  { name: "Autocomplete", component: WlAutocomplete<string, false>, props: { suggestions: ["One", "Two"] } }
] as const;

describe.each(components)("$name accessible listbox", ({ component, props }) => {
  it.each(["aria-label", "aria-labelledby"] as const)("carries %s from the focus control and resolves aria-controls", async (attribute) => {
    const label = document.createElement("span");
    label.id = "list-field-label";
    label.textContent = "Material visibility";
    document.body.append(label);
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, motion: false },
      attrs: { [attribute]: attribute === "aria-label" ? label.textContent : label.id }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      expect(control.attributes("aria-controls")).toBeUndefined();
      await control.trigger("keydown", { key: "ArrowDown" });
      const listbox = document.body.querySelector('[role="listbox"]')!;
      expect(listbox).not.toBeNull();
      expect(listbox.getAttribute(attribute)).toBe(attribute === "aria-label" ? label.textContent : label.id);
      expect(control.attributes("aria-controls")).toBe(listbox.id);
      await control.trigger("keydown", { key: "Escape" });
      expect(control.attributes("aria-controls")).toBeUndefined();
      expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    } finally { wrapper.unmount(); label.remove(); }
  });

  it("honors the consumer list name and id through pt", async () => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, motion: false, pt: { list: { id: "consumer-list", "aria-label": "Consumer choices" } } },
      attrs: { "aria-label": "Field label" }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      const listbox = document.getElementById("consumer-list")!;
      expect(listbox.getAttribute("aria-label")).toBe("Consumer choices");
      expect(control.attributes("aria-controls")).toBe(listbox.id);
    } finally { wrapper.unmount(); }
  });
});
