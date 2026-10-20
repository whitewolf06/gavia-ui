import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";

const options = [
  { id: 1, label: "Alpha", disabled: true },
  { id: 2, label: "Beta", disabled: false },
  { id: 3, label: "Bravo", disabled: false }
];
const components = [
  { name: "Select", component: WlSelect<(typeof options)[number]>, props: { options } },
  { name: "MultiSelect", component: WlMultiSelect<(typeof options)[number]>, props: { options } },
  { name: "Autocomplete", component: WlAutocomplete<(typeof options)[number], false>, props: { suggestions: options } }
] as const;

const EditableOption = defineComponent({
  props: { id: { type: Number, required: true }, label: { type: String, required: true } },
  setup(props) {
    const value = ref(props.label);
    return () => h("input", {
      "data-option-id": props.id,
      value: value.value,
      onInput: (event: Event) => { value.value = (event.target as HTMLInputElement).value; }
    });
  }
});

afterEach(() => vi.useRealTimers());

describe.each(components)("$name option customization", ({ component, props }) => {
  it("has no active option when every option is disabled", async () => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, optionLabel: "label", optionDisabled: () => true, motion: false }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      for (const key of ["Home", "End", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Enter"]) {
        await control.trigger("keydown", { key });
        expect(control.attributes("aria-activedescendant")).toBeUndefined();
      }
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });

  it("skips disabled options for keyboard and pointer selection and exposes typed slot state", async () => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, optionLabel: "label", optionDisabled: "disabled", motion: false },
      slots: { option: ({ option, index, selected, active }) => h("span", {
        "data-slot-id": option.id, "data-slot-index": index, "data-selected": selected, "data-active": active
      }, option.label) }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      const list = document.getElementById(control.attributes("aria-controls")!)!;
      const rows = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
      expect(rows[0]!.getAttribute("aria-disabled")).toBe("true");
      expect(document.getElementById(control.attributes("aria-activedescendant")!)?.textContent).toBe("Beta");
      rows[0]!.click();
      await nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await control.trigger("keydown", { key: "Home" });
      expect(control.attributes("aria-activedescendant")).toBe(rows[1]!.id);
      await control.trigger("keydown", { key: "ArrowUp" });
      expect(control.attributes("aria-activedescendant")).toBe(rows[2]!.id);
      expect(rows[2]!.querySelector("[data-slot-id]")?.getAttribute("data-active")).toBe("true");
      await control.trigger("keydown", { key: "Enter" });
      const selected = wrapper.emitted("update:modelValue")?.[0]?.[0];
      expect(selected).toEqual("options" in props && component === WlMultiSelect ? [options[2]] : options[2]);
    } finally { wrapper.unmount(); }
  });

  it("retains option slot DOM when options are reordered by a stable optionKey", async () => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, optionLabel: "label", optionKey: "id", motion: false },
      slots: { option: ({ option }) => h(EditableOption, { id: option.id, label: option.label }) }
    });
    try {
      const control = wrapper.get('[role="combobox"]');
      await control.trigger("keydown", { key: "ArrowDown" });
      const list = document.getElementById(control.attributes("aria-controls")!)!;
      const beta = list.querySelector<HTMLInputElement>('[data-option-id="2"]')!;
      beta.value = "Uncontrolled edit";
      beta.dispatchEvent(new Event("input", { bubbles: true }));
      await nextTick();
      await wrapper.setProps("suggestions" in props ? { suggestions: [options[2]!, options[1]!] } : { options: [options[2]!, options[1]!] });
      expect(list.querySelector('[data-option-id="2"]')).toBe(beta);
      expect(beta.value).toBe("Uncontrolled edit");
    } finally { wrapper.unmount(); }
  });
});

it.each([WlSelect<string>, WlAutocomplete<string, false>])("clears a single selection to null and restores focus", async (component) => {
  const wrapper = mount(component, {
    attachTo: document.body,
    props: { options: ["One"], suggestions: ["One"], modelValue: "One", clearable: true, motion: false }
  });
  try {
    const clear = wrapper.get('button[aria-label="Очистить"]');
    await clear.trigger("click");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toEqual([[null]]);
    expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element);
    expect(wrapper.get('[role="combobox"]').attributes("aria-expanded")).toBe("false");
  } finally { wrapper.unmount(); }
});

it("Select typeahead cycles matches, resets after 500 ms and supports page navigation", async () => {
  vi.useFakeTimers();
  const values = ["Alpha", "Beta", "Bravo", ...Array.from({ length: 22 }, (_, index) => `Option ${index}`)];
  const wrapper = mount(WlSelect<string>, { attachTo: document.body, props: { options: values, motion: false } });
  try {
    const control = wrapper.get('[role="combobox"]');
    await control.trigger("keydown", { key: "b" });
    const activeText = () => document.getElementById(control.attributes("aria-activedescendant")!)?.textContent?.trim();
    expect(activeText()).toBe("Beta");
    await control.trigger("keydown", { key: "r" });
    expect(activeText()).toBe("Bravo");
    await vi.advanceTimersByTimeAsync(501);
    await control.trigger("keydown", { key: "b" });
    expect(activeText()).toBe("Beta");
    await vi.advanceTimersByTimeAsync(501);
    await control.trigger("keydown", { key: "b" });
    expect(activeText()).toBe("Bravo");
    await control.trigger("keydown", { key: "Home" });
    await control.trigger("keydown", { key: "PageDown" });
    expect(activeText()).toBe(values[10]);
    await control.trigger("keydown", { key: "PageUp" });
    expect(activeText()).toBe(values[0]);
  } finally { wrapper.unmount(); }
});

it("does not consume printable keys from editable autocomplete and filter inputs", async () => {
  const wrapper = mount(WlMultiSelect<string>, {
    attachTo: document.body, props: { options: ["Alpha", "Beta"], filter: true, motion: false }
  });
  try {
    await wrapper.get('[role="combobox"]').trigger("click");
    const input = document.querySelector<HTMLInputElement>(".wl-multiselect__filter")!;
    const event = new KeyboardEvent("keydown", { key: "b", bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(false);
  } finally { wrapper.unmount(); }
});

it("renders custom value, header, footer, empty and chip content with working remove callbacks", async () => {
  const wrapper = mount(WlMultiSelect<(typeof options)[number], "id">, {
    attachTo: document.body,
    props: {
      options, modelValue: [2], optionValue: "id", display: "chip", filter: true, motion: false,
      pt: { header: { "data-header-section": "" }, footer: { "data-footer-section": "" } }
    },
    slots: {
      chip: ({ option, remove }) => h("button", { "data-chip": option.id, onClick: remove }, option.label),
      header: () => h("span", { "data-header": "" }, "Header"),
      footer: () => h("span", { "data-footer": "" }, "Footer"),
      empty: () => h("span", { "data-empty": "" }, "Empty")
    }
  });
  try {
    await wrapper.get("[data-chip]").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "ArrowDown" });
    expect(document.querySelector("[data-header]")?.textContent).toBe("Header");
    expect(document.querySelector("[data-footer]")?.textContent).toBe("Footer");
    expect(document.querySelectorAll("[data-header-section]")).toHaveLength(1);
    expect(document.querySelector("[data-header-section] [data-header]")).not.toBeNull();
    expect(document.querySelector("[data-footer-section] [data-footer]")).not.toBeNull();
    const input = document.querySelector<HTMLInputElement>(".wl-multiselect__filter")!;
    input.value = "missing";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(document.querySelector("[data-empty]")?.textContent).toBe("Empty");
  } finally { wrapper.unmount(); }
});

it("Select exposes the complete value and applies header/footer pt to custom slot wrappers", async () => {
  const wrapper = mount(WlSelect<(typeof options)[number], "id">, {
    attachTo: document.body,
    props: { options, modelValue: 2, optionValue: "id", motion: false, pt: {
      header: { "data-header-section": "" }, footer: { "data-footer-section": "" }
    } },
    slots: {
      value: ({ option }) => h("span", { "data-value": option?.id }, option?.label),
      header: () => "Header",
      footer: () => "Footer"
    }
  });
  try {
    expect(wrapper.get("[data-value]").attributes("data-value")).toBe("2");
    await wrapper.get('[role="combobox"]').trigger("click");
    expect(document.querySelector("[data-header-section]")?.textContent).toBe("Header");
    expect(document.querySelector("[data-footer-section]")?.textContent).toBe("Footer");
  } finally { wrapper.unmount(); }
});

it("Autocomplete chip slot removes its complete selected suggestion", async () => {
  const wrapper = mount(WlAutocomplete<(typeof options)[number], true>, {
    props: { suggestions: options, multiple: true, modelValue: [options[1]!] },
    slots: { chip: ({ option, remove }) => h("button", { "data-chip": option.id, onClick: remove }, option.label) }
  });
  try {
    await wrapper.get("[data-chip]").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
  } finally { wrapper.unmount(); }
});
