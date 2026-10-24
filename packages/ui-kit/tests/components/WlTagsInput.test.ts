import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";
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
  it("commits delimiter-separated input while retaining the unfinished draft and ignoring empty tags", async () => {
    const wrapper = mount(WlTagsInput, { props: { separators: [",", ";", ""], allowDuplicates: true }, attrs: { "aria-label": "Tags" } });
    try {
      const input = wrapper.get<HTMLInputElement>("input");
      await input.setValue("Vue,, TypeScript; partial");
      expect(wrapper.emitted("add")).toEqual([["Vue"], ["TypeScript"]]);
      expect(wrapper.emitted("reject")).toBeUndefined();
      expect(input.element.value).toBe(" partial");
      await input.trigger("keydown", { key: ";" });
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([["Vue", "TypeScript", "partial"]]);
      expect(input.element.value).toBe("");
      await input.trigger("paste", { clipboardData: { getData: () => "Plain draft" } });
      expect(wrapper.emitted("add")).toHaveLength(3);
    } finally { wrapper.unmount(); }
  });
  it("removes a tag through the native action and restores the exposed input focus", async () => {
    const wrapper = mount(WlTagsInput, { attachTo: document.body, props: { modelValue: ["Vue", "Testing"] }, attrs: { "aria-label": "Tags" } });
    try {
      await wrapper.get("button").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toEqual([[["Testing"]]]);
      expect(wrapper.emitted("remove")).toEqual([["Vue", 0]]);
      expect(document.activeElement).toBe(wrapper.get("input").element);
      (wrapper.get("input").element as HTMLInputElement).blur();
      wrapper.vm.focus();
      expect(document.activeElement).toBe(wrapper.get("input").element);
      await wrapper.setProps({ readonly: true });
      expect(wrapper.find("button").exists()).toBe(false);
      await wrapper.get("input").setValue("Blocked, value");
      await wrapper.get("input").trigger("paste", { clipboardData: { getData: () => "More, tags" } });
      expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    } finally { wrapper.unmount(); }
  });
  it("guards custom tag removal callbacks after locking or replacing the model", async () => {
    let removeSecond: (() => void) | undefined;
    const wrapper = mount(WlTagsInput, {
      props: { modelValue: ["Vue", "Testing"] }, attrs: { "aria-label": "Tags" },
      slots: { tag: ({ value, index, remove }) => {
        if (index === 1) removeSecond = remove;
        return h("button", { onClick: remove }, value);
      } }
    });
    try {
      const staleRemove = removeSecond!;
      await wrapper.setProps({ loading: true });
      staleRemove();
      expect(wrapper.emitted("remove")).toBeUndefined();
      await wrapper.setProps({ loading: false, modelValue: ["Vue"] });
      staleRemove();
      expect(wrapper.emitted("remove")).toBeUndefined();
      await wrapper.get("button").trigger("click");
      expect(wrapper.emitted("remove")).toEqual([["Vue", 0]]);
      await wrapper.setProps({ modelValue: [] });
      await wrapper.get("input").trigger("keydown", { key: "Backspace" });
      expect(wrapper.emitted("remove")).toHaveLength(1);
    } finally { wrapper.unmount(); }
  });
  it("keeps composing input uncommitted and serializes tags into an associated external form", async () => {
    const form = document.createElement("form");
    form.id = "external-tags-form";
    document.body.append(form);
    const wrapper = mount(WlTagsInput, {
      attachTo: document.body, props: { modelValue: ["Vue"], name: "tags" }, attrs: { form: form.id, "aria-label": "Tags" }
    });
    try {
      const input = wrapper.get<HTMLInputElement>('input[type="text"]');
      input.element.value = "未確定,";
      input.element.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
      await nextTick();
      expect(wrapper.emitted("add")).toBeUndefined();
      expect(new FormData(form).getAll("tags")).toEqual(["Vue"]);
      await wrapper.setProps({ loading: true });
      expect(new FormData(form).getAll("tags")).toEqual([]);
    } finally {
      wrapper.unmount();
      form.remove();
    }
  });
});
