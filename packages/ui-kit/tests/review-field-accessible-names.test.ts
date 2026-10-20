import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h, type VNode } from "vue";
import type { WlFieldSlotProps } from "../src/field-types";
import {
  WlAutocomplete, WlCheckbox, WlColorPicker, WlDatePicker, WlField,
  WlIconButton, WlInput, WlMultiSelect, WlNumberInput, WlPasswordInput,
  WlSelect, WlSlider, WlSwitch, WlTextarea, WlTimePicker
} from "../src";

interface ControlAttrs {
  id: string;
  "aria-labelledby": string | undefined;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  invalid: boolean;
}
interface FieldCase {
  name: string;
  render: (attrs: ControlAttrs) => VNode;
  selector: string;
  count?: number;
}
const cases: FieldCase[] = [
  { name: "Input", render: (attrs) => h(WlInput, { ...attrs }), selector: "input" },
  { name: "Textarea", render: (attrs) => h(WlTextarea, { ...attrs }), selector: "textarea" },
  { name: "PasswordInput", render: (attrs) => h(WlPasswordInput, { ...attrs }), selector: "input" },
  { name: "NumberInput", render: (attrs) => h(WlNumberInput, { ...attrs }), selector: "input" },
  { name: "Select", render: (attrs) => h(WlSelect<string>, { ...attrs, options: ["Helsinki"] }), selector: "[role=combobox]" },
  { name: "MultiSelect", render: (attrs) => h(WlMultiSelect<string>, { ...attrs, options: ["Helsinki"] }), selector: "[role=combobox]" },
  { name: "Autocomplete", render: (attrs) => h(WlAutocomplete<string>, { ...attrs, suggestions: ["Helsinki"] }), selector: "input" },
  { name: "DatePicker", render: (attrs) => h(WlDatePicker<"single">, { ...attrs }), selector: "input" },
  { name: "DatePicker range", render: (attrs) => h(WlDatePicker<"range">, { ...attrs, selectionMode: "range" }), selector: "input", count: 2 },
  { name: "TimePicker native", render: (attrs) => h(WlTimePicker, { ...attrs }), selector: "input" },
  { name: "TimePicker formatted", render: (attrs) => h(WlTimePicker, { ...attrs, hourFormat: 24 }), selector: "input" },
  { name: "ColorPicker", render: (attrs) => h(WlColorPicker, { ...attrs }), selector: ".wl-color-picker__hex" },
  { name: "Slider", render: (attrs) => h(WlSlider, { ...attrs }), selector: "input" },
  { name: "Slider range", render: (attrs) => h(WlSlider, { ...attrs, range: true }), selector: "input", count: 2 },
  { name: "Checkbox", render: (attrs) => h(WlCheckbox<undefined>, { ...attrs }), selector: "input" },
  { name: "Switch", render: (attrs) => h(WlSwitch, { ...attrs }), selector: "input" },
  { name: "IconButton", render: (attrs) => h(WlIconButton, { ...attrs }), selector: "button" }
];

describe("WlField names its focusable controls", () => {
  it.each(cases)("connects $name to its visible label, help and error", ({ render, selector, count = 1 }) => {
    const wrapper = mount({
      render: () => h(WlField, { label: "Travel setting", hint: "Use your preferred value", error: "Choose a valid value" }, {
        default: (field: WlFieldSlotProps) => render({
          id: field.inputId,
          "aria-labelledby": field.labelId,
          "aria-describedby": field.ariaDescribedby,
          "aria-invalid": field.ariaInvalid,
          invalid: field.invalid
        })
      })
    });
    try {
      const label = wrapper.get(".wl-field__label");
      const controls = wrapper.findAll(selector);
      expect(controls).toHaveLength(count);
      expect(controls[0]!.attributes("id")).toBe(label.attributes("for"));
      for (const control of controls) {
        const labelIds = control.attributes("aria-labelledby")!.split(/\s+/);
        expect(labelIds).toContain(label.attributes("id"));
        for (const id of labelIds) expect(wrapper.get(`[id="${id}"]`).text().trim()).not.toBe("");
        const descriptions = control.attributes("aria-describedby")!.split(/\s+/);
        expect(descriptions.map((id) => wrapper.get(`[id="${id}"]`).text())).toEqual([
          "Use your preferred value", "Choose a valid value"
        ]);
        expect(control.attributes("aria-invalid")).toBe("true");
      }
      expect(new Set(wrapper.findAll("[id]").map((node) => node.attributes("id"))).size)
        .toBe(wrapper.findAll("[id]").length);
    } finally {
      wrapper.unmount();
    }
  });
});
