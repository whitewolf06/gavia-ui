import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";

interface Item { id: number; label: string; disabled?: boolean }
interface Group { title: string; items: readonly Item[] }
const groups: readonly Group[] = [
  { title: "First", items: [{ id: 1, label: "Alpha", disabled: true }, { id: 2, label: "Beta" }] },
  { title: "Second", items: [{ id: 3, label: "Gamma" }] }
];
const wrappers: VueWrapper[] = [];
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  await nextTick();
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe("grouped Select", () => {
  it("names groups and keeps flat keyboard indices while skipping disabled leaves", async () => {
    const wrapper = mount(WlSelect<Group, "id", "items">, {
      attachTo: document.body,
      props: { options: groups, optionGroupChildren: "items", optionGroupLabel: "title", optionLabel: "label", optionValue: "id", optionDisabled: "disabled", motion: false }
    });
    wrappers.push(wrapper);
    const control = wrapper.get('[role="combobox"]');
    await control.trigger("click");
    expect([...document.querySelectorAll('[role="group"]')].map((group) => group.getAttribute("aria-label"))).toEqual(["First", "Second"]);
    const options = document.querySelectorAll<HTMLElement>('[role="option"]');
    expect(control.attributes("aria-activedescendant")).toBe(options[1]?.id);
    await control.trigger("keydown", { key: "ArrowDown" });
    expect(control.attributes("aria-activedescendant")).toBe(options[2]?.id);
    await control.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([[3]]);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it("filters leaves and groups while preserving the selected display and exposes open/close/focus", async () => {
    const wrapper = mount(WlSelect<Group, "id", "items">, {
      attachTo: document.body,
      props: { modelValue: 2, options: groups, optionGroupChildren: "items", optionGroupLabel: "title", optionLabel: "label", optionValue: "id", filter: true, motion: false }
    });
    wrappers.push(wrapper);
    wrapper.vm.open();
    await flushPromises();
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    expect(document.activeElement).toBe(search);
    search.value = "GAM";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(document.querySelector('[role="listbox"]')?.textContent).toContain("Gamma");
    expect(document.querySelector('[role="listbox"]')?.textContent).not.toContain("First");
    expect(wrapper.get(".wl-select__label").text()).toBe("Beta");
    expect(search.getAttribute("aria-activedescendant")).toBe(document.querySelector('[role="option"]')?.id);
    search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toEqual([[3]]);
    wrapper.vm.open();
    await nextTick();
    wrapper.vm.close();
    await nextTick();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    wrapper.vm.focus();
    expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element);
  });

  it("renders loading instead of stale or empty options and resumes keyboard selection when ready", async () => {
    const wrapper = mount(WlSelect<string>, {
      attachTo: document.body, props: { options: ["One"], loading: true, motion: false }, slots: { loading: "Fetching" }
    });
    wrappers.push(wrapper);
    const control = wrapper.get('[role="combobox"]');
    await control.trigger("click");
    expect(control.attributes("aria-busy")).toBe("true");
    expect(control.attributes("aria-activedescendant")).toBeUndefined();
    expect(document.querySelector('[role="listbox"]')?.textContent).toBe("Fetching");
    expect(document.querySelector('[role="option"]')).toBeNull();
    await control.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ loading: false });
    await control.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([["One"]]);
  });

  it("accepts callback group resolvers and typed group/option slots", async () => {
    const children = (group: Group) => group.items;
    const wrapper = mount(WlSelect<Group, "id", typeof children>, {
      attachTo: document.body,
      props: { options: groups, optionGroupChildren: children, optionGroupLabel: (group) => group.title, optionLabel: "label", optionValue: "id", motion: false },
      slots: { optiongroup: ({ label }) => `Group ${label}`, option: ({ option }) => `Item ${option.id}` }
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger("click");
    expect(document.querySelector('[role="listbox"]')?.textContent).toContain("Group First");
    expect(document.querySelector('[role="option"]')?.textContent).toBe("Item 1");
  });

  it("preserves keyed option slot state while filtering and reordering group wrappers", async () => {
    const Draft = defineComponent({
      props: {
        optionId: { type: Number, default: undefined },
        initial: { type: String, default: undefined }
      },
      setup(props) {
        const value = ref(props.initial);
        return () => h("input", {
          "data-option-id": props.optionId, value: value.value,
          onInput: (event: Event) => {
            value.value = (event.target as HTMLInputElement).value;
          }
        });
      }
    });
    const wrapper = mount(WlSelect<Group, "id", "items">, {
      attachTo: document.body,
      props: { options: groups, optionGroupChildren: "items", optionGroupLabel: "title", optionLabel: "label", optionValue: "id", optionKey: "id", filter: true, motion: false },
      slots: { option: ({ option }) => h(Draft, { optionId: option.id, initial: option.label }) }
    });
    wrappers.push(wrapper);
    wrapper.vm.open();
    await flushPromises();
    const gamma = document.querySelector<HTMLInputElement>('[data-option-id="3"]')!;
    gamma.value = "Draft";
    gamma.dispatchEvent(new Event("input", { bubbles: true }));
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = "Gamma";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(document.querySelector('[data-option-id="3"]')).toBe(gamma);
    expect(gamma.value).toBe("Draft");
    search.value = "";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    await wrapper.setProps({ options: [...groups].reverse() });
    expect(document.querySelector('[data-option-id="3"]')).toBe(gamma);
    expect(gamma.value).toBe("Draft");
  });
});

describe("MultiSelect select all", () => {
  it("toggles only visible enabled leaves, preserving disabled and external values", async () => {
    const wrapper = mount(WlMultiSelect<Group, "id", "items">, {
      attachTo: document.body,
      props: { modelValue: [1, 99], options: groups, optionGroupChildren: "items", optionGroupLabel: "title", optionLabel: "label", optionValue: "id", optionDisabled: "disabled", showSelectAll: true, filter: true, motion: false }
    });
    wrappers.push(wrapper);
    vi.spyOn(wrapper.get(".wl-multiselect").element, "getBoundingClientRect").mockReturnValue({
      x: 20, y: 30, width: 240, height: 32, top: 30, left: 20, bottom: 62, right: 260, toJSON: () => ({})
    });
    wrapper.vm.open();
    await flushPromises();
    expect(document.querySelector<HTMLElement>(".wl-multiselect-overlay")?.style.minWidth).toBe("240px");
    const all = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    all.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toEqual([[[1, 99, 2, 3]]]);
    await wrapper.setProps({ modelValue: [1, 99, 2, 3] });
    expect(all.checked).toBe(true);
    all.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[1, 99]]);
    await wrapper.setProps({ modelValue: [1, 99, 2] });
    expect(all.indeterminate).toBe(true);
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = "Gamma";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(all.checked).toBe(false);
    expect(all.indeterminate).toBe(false);
    all.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[1, 99, 2, 3]]);
    await wrapper.setProps({ modelValue: [1, 99, 2, 3] });
    all.click();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[1, 99, 2]]);
  });

  it("disables select all while loading and for a filtered set containing only disabled leaves", async () => {
    const wrapper = mount(WlMultiSelect<Group, "id", "items">, {
      attachTo: document.body,
      props: { options: groups, optionGroupChildren: "items", optionLabel: "label", optionValue: "id", optionDisabled: "disabled", showSelectAll: true, loading: true, filter: true, motion: false },
      slots: { loading: "Fetching" }
    });
    wrappers.push(wrapper);
    wrapper.vm.open();
    await flushPromises();
    const all = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(all.disabled).toBe(true);
    expect(document.querySelector('[role="option"]')).toBeNull();
    expect(document.querySelector('[role="listbox"]')?.textContent).toBe("Fetching");
    await wrapper.setProps({ loading: false });
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = "Alpha";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await nextTick();
    expect(all.disabled).toBe(true);
    all.click();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});

describe("Autocomplete request state", () => {
  it("debounces the latest query and cancels requests below minLength, on disable and on unmount", async () => {
    vi.useFakeTimers();
    const completed = vi.fn();
    const wrapper = mount(WlAutocomplete<string, false>, {
      attachTo: document.body, props: { debounce: 80, minLength: 2, motion: false, onComplete: completed }
    });
    wrappers.push(wrapper);
    const input = wrapper.get("input");
    await input.setValue("Al");
    await vi.advanceTimersByTimeAsync(50);
    await input.setValue("Alp");
    await vi.advanceTimersByTimeAsync(79);
    expect(wrapper.emitted("complete")).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(wrapper.emitted("complete")?.map(([event]) => (event as { query: string }).query)).toEqual(["Alp"]);
    await input.setValue("Beta");
    await input.setValue("B");
    await vi.advanceTimersByTimeAsync(80);
    expect(wrapper.emitted("complete")).toHaveLength(1);
    await input.setValue("Gamma");
    await wrapper.setProps({ disabled: true });
    await vi.advanceTimersByTimeAsync(80);
    expect(wrapper.emitted("complete")).toHaveLength(1);
    await wrapper.setProps({ disabled: false });
    await input.setValue("Delta");
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    await vi.advanceTimersByTimeAsync(80);
    expect(completed).toHaveBeenCalledTimes(1);
  });

  it("hides stale suggestions and suppresses selection until loading completes", async () => {
    const wrapper = mount(WlAutocomplete<string, false>, {
      attachTo: document.body, props: { suggestions: ["Alpha"], loading: true, dropdown: true, motion: false }, slots: { loading: "Fetching" }
    });
    wrappers.push(wrapper);
    await wrapper.get("button").trigger("click");
    const input = wrapper.get("input");
    expect(input.attributes("aria-busy")).toBe("true");
    expect(input.attributes("aria-activedescendant")).toBeUndefined();
    expect(document.querySelector('[role="listbox"]')?.textContent).toBe("Fetching");
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ loading: false });
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toEqual([["Alpha"]]);
  });
});
