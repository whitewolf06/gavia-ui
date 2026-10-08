import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount } from "@vue/test-utils";
import { WlAutocomplete, WlFileUpload, WlInput, WlMultiSelect, WlNumberInput, WlPagination, WlPasswordInput, WlSelect, WlSlider, WlTextarea, WlTimePicker } from "../src";

describe("Input public contract safety", () => {
  afterEach(() => vi.useRealTimers());

  for (const [name, control] of [["Input", WlInput], ["PasswordInput", WlPasswordInput], ["Textarea", WlTextarea]] as const) {
    it(`${name} emits a string through the supported text trim modifier`, async () => {
      const Harness = defineComponent({
        components: { Control: control },
        setup: () => ({ value: ref(""), updates: [] as string[] }),
        template: '<Control v-model.trim="value" @update:model-value="updates.push($event)" />'
      });
      const wrapper = mount(Harness);
      try {
        await wrapper.get("input,textarea").setValue("  word  ");
        expect(wrapper.vm.updates).toEqual(["word"]);
        expect(wrapper.vm.value).toBe("word");
      } finally { wrapper.unmount(); }
    });
  }

  it("accepts one dropped file in single mode and reports extra files as count rejections", async () => {
    const first = new File(["first"], "first.txt", { type: "text/plain" });
    const second = new File(["second"], "second.txt", { type: "text/plain" });
    const wrapper = mount(WlFileUpload, { props: { multiple: false, modelValue: [] } });
    try {
      await wrapper.get(".wl-upload__drop").trigger("drop", { dataTransfer: { files: [first, second] } });
      expect(wrapper.emitted("update:modelValue")).toEqual([[[first]]]);
      expect(wrapper.emitted("reject")).toEqual([[{ file: second, reason: "count" }]]);
    } finally { wrapper.unmount(); }
  });

  it("preserves the accepted single file when its proposed replacement is rejected", async () => {
    const previous = new File(["valid"], "previous.txt", { type: "text/plain" });
    const rejected = new File(["image"], "image.png", { type: "image/png" });
    const replacement = new File(["new"], "next.txt", { type: "text/plain" });
    const wrapper = mount(WlFileUpload, { props: { multiple: false, accept: ".txt", modelValue: [previous] } });
    try {
      await wrapper.get(".wl-upload__drop").trigger("drop", { dataTransfer: { files: [rejected] } });
      expect(wrapper.emitted("reject")).toEqual([[{ file: rejected, reason: "type" }]]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.get(".wl-upload__name").text()).toBe("previous.txt");
      await wrapper.get(".wl-upload__drop").trigger("drop", { dataTransfer: { files: [replacement] } });
      expect(wrapper.emitted("update:modelValue")).toEqual([[[replacement]]]);
    } finally { wrapper.unmount(); }
  });

  const options = [{ id: 1, label: "One" }, { id: 2, label: "Two" }];
  const selectors = [
    { name: "Select", component: WlSelect, root: ".wl-select", overlay: ".wl-select-overlay", initial: 1, props: { options, optionLabel: "label", optionValue: "id" } },
    { name: "MultiSelect", component: WlMultiSelect, root: ".wl-multiselect", overlay: ".wl-multiselect-overlay", initial: [1], props: { options, optionLabel: "label", optionValue: "id", display: "chip" } },
    { name: "Autocomplete", component: WlAutocomplete, root: ".wl-autocomplete__dropdown", overlay: ".wl-autocomplete-overlay", initial: [options[0]], props: { suggestions: options, optionLabel: "label", multiple: true, dropdown: true } }
  ];

  for (const control of selectors) {
    it(`${control.name} closes an open overlay on disable and ignores its stale option handler`, async () => {
      const Harness = defineComponent({
        components: { Control: control.component },
        props: { disabled: Boolean },
        setup: () => ({ controlProps: control.props, initial: control.initial, updates: [] as unknown[] }),
        template: '<Control :model-value="initial" v-bind="controlProps" :disabled="disabled" :motion="false" @update:model-value="updates.push($event)" />'
      });
      const wrapper = mount(Harness, { attachTo: document.body });
      try {
        await wrapper.get(control.root).trigger("click");
        const option = document.body.querySelectorAll<HTMLElement>(`${control.overlay} [role=option]`)[1];
        expect(option).toBeDefined();
        await wrapper.setProps({ disabled: true });
        expect(document.body.querySelector(control.overlay)).toBeNull();
        // A retained handler must also respect disabled, independently of DOM removal.
        option!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(wrapper.vm.updates).toEqual([]);
      } finally { wrapper.unmount(); }
    });
  }

  for (const control of selectors.slice(1)) {
    it(`${control.name} disables chip removal and guards a dispatched click`, async () => {
      const Harness = defineComponent({
        components: { Control: control.component },
        setup: () => ({ controlProps: control.props, initial: control.initial, updates: [] as unknown[] }),
        template: '<Control :model-value="initial" v-bind="controlProps" disabled @update:model-value="updates.push($event)" />'
      });
      const wrapper = mount(Harness);
      try {
        const remove = wrapper.get<HTMLButtonElement>(".wl-multiselect__chip-remove");
        expect(remove.element.disabled).toBe(true);
        remove.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(wrapper.vm.updates).toEqual([]);
      } finally { wrapper.unmount(); }
    });
  }

  it("Autocomplete cancels a pending completion when disabled", async () => {
    vi.useFakeTimers();
    const Harness = defineComponent({
      components: { WlAutocomplete },
      props: { disabled: Boolean },
      setup: () => ({ options, completed: [] as unknown[] }),
      template: '<WlAutocomplete :suggestions="options" :disabled="disabled" :motion="false" @complete="completed.push($event)" />'
    });
    const wrapper = mount(Harness, { attachTo: document.body });
    try {
      await wrapper.get("input").setValue("One");
      await wrapper.setProps({ disabled: true });
      await vi.advanceTimersByTimeAsync(300);
      expect(wrapper.vm.completed).toEqual([]);
    } finally { wrapper.unmount(); }
  });

  it("NumberInput cannot commit a draft after disabling and retains unbounded limits", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3, min: -Infinity, max: Infinity } });
    try {
      const input = wrapper.get("input");
      await input.setValue("8");
      await wrapper.setProps({ disabled: true });
      input.element.dispatchEvent(new FocusEvent("blur"));
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      await wrapper.setProps({ disabled: false, step: NaN });
      await wrapper.get(".wl-stepper__btn:last-child").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toEqual([[4]]);
    } finally { wrapper.unmount(); }
  });

  it("NumberInput handles NaN and reversed bounds without emitting nonfinite values", async () => {
    const wrapper = mount(WlNumberInput, { props: { modelValue: 3, min: NaN, max: NaN, step: -2 } });
    try {
      await wrapper.get(".wl-stepper__btn:last-child").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toEqual([[4]]);
      await wrapper.setProps({ min: 10, max: 5 });
      await wrapper.get("input").setValue("7");
      await wrapper.get("input").trigger("blur");
      expect(wrapper.emitted("update:modelValue")?.slice(-1)[0]).toEqual([10]);
    } finally { wrapper.unmount(); }
  });

  it("Pagination emits integer pages and normalizes nonfinite and excessive windows", async () => {
    const wrapper = mount(WlPagination, { props: { page: 1, pageCount: 2.5 } });
    try {
      await wrapper.get('button[aria-label="Следующая страница"]').trigger("click");
      expect(wrapper.emitted("update:page")).toEqual([[2]]);
      await wrapper.setProps({ pageCount: Infinity, siblings: Infinity });
      expect(wrapper.findAll(".wl-pager__btn:not(.wl-pager__nav)")).toHaveLength(1);
      await wrapper.setProps({ pageCount: Number.MAX_SAFE_INTEGER, siblings: Number.MAX_SAFE_INTEGER });
      expect(wrapper.findAll(".wl-pager__btn").length).toBeLessThanOrEqual(210);
    } finally { wrapper.unmount(); }
  });

  it("Pagination does not commit a compact draft after disabling", async () => {
    const wrapper = mount(WlPagination, { props: { compact: true, page: 2, pageCount: 10 } });
    try {
      const input = wrapper.get("input");
      await input.setValue("7");
      await wrapper.setProps({ disabled: true });
      input.element.dispatchEvent(new FocusEvent("blur"));
      expect(wrapper.emitted("update:page")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });

  it("Slider renders a finite percentage with invalid or reversed bounds and ignores disabled input", async () => {
    const wrapper = mount(WlSlider, { props: { modelValue: NaN, min: NaN, max: Infinity, step: 0 } });
    try {
      const input = wrapper.get<HTMLInputElement>("input");
      expect(input.element.style.getPropertyValue("--wl-slider-pct")).toBe("0%");
      expect(input.attributes("min")).toBe("0");
      expect(input.attributes("max")).toBe("100");
      expect(input.attributes("step")).toBe("1");
      await wrapper.setProps({ modelValue: 0, min: -Number.MAX_VALUE, max: Number.MAX_VALUE });
      expect(input.element.style.getPropertyValue("--wl-slider-pct")).toBe("50%");
      await wrapper.setProps({ modelValue: 12, min: 10, max: 5, disabled: true });
      expect(input.element.style.getPropertyValue("--wl-slider-pct")).toBe("0%");
      input.element.value = "10";
      input.element.dispatchEvent(new Event("input", { bubbles: true }));
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    } finally { wrapper.unmount(); }
  });

  it("TimePicker ignores invalid time bounds but preserves valid wrap-around ranges", async () => {
    const wrapper = mount(WlTimePicker, { props: { minTime: "bad", maxTime: "99:99" } });
    try {
      await wrapper.get("input").setValue("12:30");
      expect(wrapper.emitted("update:modelValue")).toEqual([["12:30"]]);
      expect(wrapper.get("input").attributes("min")).toBeUndefined();
      await wrapper.setProps({ minTime: "22:00", maxTime: "02:00" });
      await wrapper.get("input").setValue("23:00");
      await wrapper.get("input").setValue("12:00");
      expect(wrapper.emitted("update:modelValue")).toEqual([["12:30"], ["23:00"]]);
    } finally { wrapper.unmount(); }
  });
});
