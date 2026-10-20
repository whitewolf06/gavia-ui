import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import WlTagsInput from "../../src/components/WlTagsInput.vue";
describe("WlTagsInput", () => {
  it("adds values and rejects duplicate, invalid and over-limit pasted tags", async () => {
    const wrapper = mount(WlTagsInput, { props: { modelValue: ["Vue"], max: 3, validator: (value: string) => value.length > 1 }, attrs: { "aria-label": "Tags" } });
    const input = wrapper.get("input");
    await input.setValue("TypeScript");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([[["Vue", "TypeScript"]]]);
    await wrapper.setProps({ modelValue: ["Vue", "TypeScript"] });
    await input.trigger("paste", { clipboardData: { getData: () => "Vue, x, Testing, Extra" } });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["Vue", "TypeScript", "Testing"]]);
    expect(wrapper.emitted("reject")).toEqual([["Vue", "duplicate"], ["x", "invalid"], ["Extra", "max"]]);
    wrapper.unmount();
  });
  it("guards IME and disabled edits, removes last tag with Backspace", async () => {
    const wrapper = mount(WlTagsInput, { props: { modelValue: ["Vue", "Testing"] }, attrs: { "aria-label": "Tags" } });
    const input = wrapper.get("input");
    await input.setValue("日本語");
    await input.trigger("compositionstart");
    await input.trigger("keydown", { key: "Enter", isComposing: true });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await input.trigger("compositionend");
    await input.setValue("");
    await input.trigger("keydown", { key: "Backspace" });
    expect(wrapper.emitted("update:modelValue")).toEqual([[["Vue"]]]);
    expect(wrapper.get("button").attributes("aria-label")).toContain("Vue");
    await wrapper.setProps({ disabled: true });
    await input.trigger("keydown", { key: "Backspace" });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    wrapper.unmount();
  });
  it("serializes selected tags for native forms while keeping the editing draft separate", async () => {
    const wrapper = mount({ render: () => h("form", [h(WlTagsInput, { modelValue: ["Vue", "Testing"], name: "tags" })]) });
    try {
      await wrapper.get('input[type="text"]').setValue("Uncommitted");
      const data = new FormData(wrapper.get("form").element as HTMLFormElement);
      expect(data.getAll("tags")).toEqual(["Vue", "Testing"]);
    } finally { wrapper.unmount(); }
  });
});
