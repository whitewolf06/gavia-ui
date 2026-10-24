import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";

const components = [
  { name: "Select", component: WlSelect<string>, props: { options: ["One", "Two", "Three"] } },
  { name: "MultiSelect", component: WlMultiSelect<string>, props: { options: ["One", "Two", "Three"] } },
  { name: "Autocomplete", component: WlAutocomplete<string, false>, props: { suggestions: ["One", "Two", "Three"] } }
] as const;

afterEach(() => vi.restoreAllMocks());

describe.each(components)("$name active option contract", ({ component, props }) => {
  it("links the focused option, wraps navigation, and removes the reference on close", async () => {
    const wrapper = mount(component, { attachTo: document.body, props: { ...props, motion: false } });
    try {
      const control = wrapper.get('[role="combobox"]');
      expect(control.attributes("aria-activedescendant")).toBeUndefined();
      await control.trigger("keydown", { key: "ArrowDown" });
      const list = document.getElementById(control.attributes("aria-controls")!)!;
      const options = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
      expect(new Set(options.map((option) => option.id)).size).toBe(3);
      expect(options.every((option) => option.id.length > 0)).toBe(true);
      expect(control.attributes("aria-activedescendant")).toBe(options[0]!.id);
      for (const [key, index] of [["ArrowDown", 1], ["End", 2], ["ArrowDown", 0], ["ArrowUp", 2], ["Home", 0]] as const) {
        await control.trigger("keydown", { key });
        expect(control.attributes("aria-activedescendant")).toBe(options[index]!.id);
        expect(list.querySelector('[data-active="true"]')).toBe(options[index]);
      }
      await control.trigger("keydown", { key: "Escape" });
      expect(control.attributes("aria-activedescendant")).toBeUndefined();
      expect(document.getElementById(list.id)).toBeNull();
      await control.trigger("keydown", { key: "ArrowDown" });
      expect(document.getElementById(control.attributes("aria-activedescendant")!)).not.toBeNull();
    } finally { wrapper.unmount(); }
  });

  it("scrolls the active option into view and handles shorter or empty results", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    const wrapper = mount(component, { attachTo: document.body, props: { ...props, motion: false } });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      await control.trigger("keydown", { key: "End" });
      await nextTick();
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById(control.attributes("aria-activedescendant")!));
      await wrapper.setProps("suggestions" in props ? { suggestions: ["One"] } : { options: ["One"] });
      expect(document.getElementById(control.attributes("aria-activedescendant")!)?.textContent).toContain("One");
      await wrapper.setProps("suggestions" in props ? { suggestions: [] } : { options: [] });
      expect(control.attributes("aria-activedescendant")).toBeUndefined();
      await control.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally {
      wrapper.unmount();
      if (descriptor) Object.defineProperty(Element.prototype, "scrollIntoView", descriptor);
      else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    }
  });

  it("derives option IDs from a consumer's list ID", async () => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, motion: false, pt: { list: { id: "consumer:list/choices" } } }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      expect(control.attributes("aria-activedescendant")).toBe("consumer:list/choices-option-0");
      expect(document.getElementById(control.attributes("aria-activedescendant")!)?.getAttribute("role")).toBe("option");
    } finally { wrapper.unmount(); }
  });
});

it("Select prevents pointer focus changes and selects only on click", async () => {
  const wrapper = mount(WlSelect<string>, { attachTo: document.body, props: { options: ["One", "Two"], motion: false } });
  try {
    await wrapper.get('[role="combobox"]').trigger("click");
    const option = document.querySelector<HTMLElement>('[role="option"]')!;
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    option.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    option.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toEqual([["One"]]);
  } finally { wrapper.unmount(); }
});

it("MultiSelect gives the focused search input its active option relationship", async () => {
  const wrapper = mount(WlMultiSelect<string>, {
    attachTo: document.body,
    props: { options: ["One", "Two", "Three"], filter: true, motion: false }
  });
  try {
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    const input = document.querySelector<HTMLInputElement>(".wl-multiselect__filter")!;
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("role")).toBe("combobox");
    expect(document.getElementById(input.getAttribute("aria-controls")!)).not.toBeNull();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await nextTick();
    expect(document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent).toContain("Three");
  } finally { wrapper.unmount(); }
});
