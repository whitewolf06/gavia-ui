import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import type { WlTableColumn, WlTableHeaderSlotProps, WlTableSort } from "../src/table-types";
import { WlConfig, wlLocaleEn, WlTable } from "../src";

interface Person { id: number; name: string; score: number }
const rows: Person[] = [{ id: 1, name: "Alpha", score: 8 }, { id: 2, name: "Beta", score: 3 }, { id: 3, name: "Gamma", score: 5 }];
const columns: WlTableColumn<Person>[] = [{ key: "name", label: "Name", sortable: true }, { key: "score", label: "Score", numeric: true, align: "end", sortable: true }];
const global = { plugins: [[WlConfig, { locale: wlLocaleEn }]] as [typeof WlConfig, { locale: typeof wlLocaleEn }][] };
const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  vi.restoreAllMocks();
});

describe("stable table row identity", () => {
  it.each([
    ["field", "id"], ["resolver", (row: Person) => row.id]
  ] as const)("keeps edited child-cell state attached to its row with a %s rowKey", async (_label, keyer) => {
    const Cell = defineComponent({
      props: { initial: { type: String, required: true } },
      setup(props) {
        const value = ref(props.initial);
        return () => h("input", { value: value.value, onInput: (event: Event) => {
          value.value = (event.target as HTMLInputElement).value;
        } });
      }
    });
    const Harness = defineComponent({
      components: { WlTable, Cell },
      setup: () => ({ items: ref([...rows]), columns, keyer }),
      template: "<WlTable :value=\"items\" :columns=\"columns\" :row-key=\"keyer\"><template #cell-name=\"{value}\"><Cell :initial=\"value\" /></template></WlTable>"
    });
    const wrapper = mount(Harness, { global });
    wrappers.push(wrapper);
    const beta = wrapper.findAll("input")[1]!;
    await beta.setValue("Edited Beta");
    wrapper.vm.items = wrapper.vm.items.slice(1);
    await nextTick();
    expect(wrapper.findAll("input")[0]!.element).toBe(beta.element);
    expect((wrapper.findAll("input")[0]!.element as HTMLInputElement).value).toBe("Edited Beta");
    wrapper.vm.items = [...wrapper.vm.items].reverse();
    await nextTick();
    expect(wrapper.findAll("input")[1]!.element).toBe(beta.element);
    expect((wrapper.findAll("input")[1]!.element as HTMLInputElement).value).toBe("Edited Beta");
  });

  it("retains the legacy index fallback and warns when selection needs a stable key", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, selectionMode: "multiple" } });
    wrappers.push(wrapper);
    wrapper.findAll('tbody input[type="checkbox"]')[1]!.element.dispatchEvent(new Event("change", { bubbles: true }));
    expect(wrapper.emitted("update:selection")).toEqual([[[1]]]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("provide rowKey"));
  });
});

describe("controlled table sorting", () => {
  it("cycles ascending, descending and clear without sorting application data implicitly", async () => {
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, rowKey: "id", sort: null } });
    wrappers.push(wrapper);
    const button = wrapper.get('th button[aria-label="Name: sort ascending"]');
    expect(button.attributes("type")).toBe("button");
    await button.trigger("click");
    expect(wrapper.emitted("update:sort")?.[0]).toEqual([{ key: "name", direction: "asc" }]);
    await wrapper.setProps({ sort: { key: "name", direction: "asc" } });
    expect(wrapper.findAll("th")[0]!.attributes("aria-sort")).toBe("ascending");
    await button.trigger("click");
    expect(wrapper.emitted("update:sort")?.[1]).toEqual([{ key: "name", direction: "desc" }]);
    await wrapper.setProps({ sort: { key: "name", direction: "desc" } });
    expect(wrapper.findAll("th")[0]!.attributes("aria-sort")).toBe("descending");
    await button.trigger("click");
    expect(wrapper.emitted("update:sort")?.[2]).toEqual([null]);
    expect(wrapper.findAll("tbody tr").map((row) => row.findAll("td")[0]!.text())).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("applies the optional app sort function without mutating its input", async () => {
    const sortFn = vi.fn((value: readonly Person[], order: WlTableSort) => [...value].sort((a, b) => order.direction === "asc" ? a.score - b.score : b.score - a.score));
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, rowKey: "id", sort: { key: "score", direction: "asc" }, sortFn } });
    wrappers.push(wrapper);
    expect(wrapper.findAll("tbody tr").map((row) => row.findAll("td")[0]!.text())).toEqual(["Beta", "Gamma", "Alpha"]);
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3]);
    expect(sortFn).toHaveBeenCalledWith(rows, { key: "score", direction: "asc" });
    await wrapper.setProps({ sort: null });
    expect(wrapper.findAll("tbody tr")[0]!.text()).toContain("Alpha");
  });
});

describe("table row selection", () => {
  it("exposes mixed select-all state and preserves off-page keys when selecting or clearing current rows", async () => {
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, rowKey: "id", selectionMode: "multiple", selection: [99, 2] } });
    wrappers.push(wrapper);
    const all = wrapper.get<HTMLInputElement>('thead input[type="checkbox"]');
    expect(all.element.indeterminate).toBe(true);
    expect(all.attributes("aria-checked")).toBe("mixed");
    expect(all.attributes("aria-label")).toBe("Select all rows");
    await all.setValue(true);
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([[99, 2, 1, 3]]);
    await wrapper.setProps({ selection: [99, 1, 2, 3] });
    expect(all.element.indeterminate).toBe(false);
    expect(all.element.checked).toBe(true);
    await all.setValue(false);
    expect(wrapper.emitted("update:selection")?.[1]).toEqual([[99]]);
    await wrapper.setProps({ selection: [99, 2] });
    await wrapper.findAll('tbody input[type="checkbox"]')[1]!.setValue(false);
    expect(wrapper.emitted("update:selection")?.[2]).toEqual([[99]]);
  });

  it("uses an exclusive radio group for single selection and separate names for each table", async () => {
    const Harness = defineComponent({
      components: { WlTable }, setup: () => ({ rows, columns, selected: ref<PropertyKey[]>([1]) }),
      template: '<WlTable v-model:selection="selected" :value="rows" :columns="columns" row-key="id" selection-mode="single" /><WlTable :value="rows" :columns="columns" row-key="id" selection-mode="single" />'
    });
    const wrapper = mount(Harness, { global });
    wrappers.push(wrapper);
    const radios = wrapper.findAll<HTMLInputElement>('input[type="radio"]');
    expect(radios[0]!.attributes("name")).not.toBe(radios[3]!.attributes("name"));
    await radios[1]!.setValue(true);
    expect(wrapper.vm.selected).toEqual([2]);
    expect(radios[0]!.element.checked).toBe(false);
    expect(radios[1]!.element.checked).toBe(true);
    expect(wrapper.find("thead input").exists()).toBe(false);
  });

  it("disables sorting and selection while loading and does not select empty tables", () => {
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, rowKey: "id", loading: true, selectionMode: "multiple" } });
    wrappers.push(wrapper);
    for (const input of wrapper.findAll<HTMLInputElement>("input")) expect(input.element.disabled).toBe(true);
    for (const button of wrapper.findAll<HTMLButtonElement>("th button")) expect(button.element.disabled).toBe(true);
    const empty = mount(WlTable<Person>, { global, props: { value: [], columns, rowKey: "id", selectionMode: "multiple" } });
    wrappers.push(empty);
    expect(empty.get<HTMLInputElement>("thead input").element.disabled).toBe(true);
    expect(empty.get(".wl-table__empty-cell").attributes("colspan")).toBe("3");
  });
});

describe("table presentation and slots", () => {
  it("renders caption, explicit table label, alignment, sticky header and row classes", () => {
    const wrapper = mount(WlTable<Person>, { global, props: {
      value: rows, columns, rowKey: "id", caption: "People", ariaLabel: "Scores", stickyHeader: true,
      rowClass: (row) => ({ highlight: row.score > 5 })
    } });
    wrappers.push(wrapper);
    expect(wrapper.get("caption").text()).toBe("People");
    expect(wrapper.get("table").attributes("aria-label")).toBe("Scores");
    expect(wrapper.get("thead").classes()).toContain("wl-table__head--sticky");
    expect(wrapper.findAll("th")[1]!.attributes("style")).toContain("text-align: end");
    expect(wrapper.findAll("tbody tr")[0]!.classes()).toContain("highlight");
    expect(wrapper.findAll("tbody tr")[1]!.classes()).not.toContain("highlight");
    expect(wrapper.findAll("tbody td.wl-table__cell--num")).toHaveLength(3);
  });

  it("keeps caption/header/cell, loading and empty slots usable", async () => {
    const wrapper = mount(WlTable<Person>, { global, props: { value: rows, columns, rowKey: "id" }, slots: {
      caption: () => h("strong", "Custom caption"),
      "header-name": (scope: WlTableHeaderSlotProps<Person>) => h("span", `Custom ${scope.column.label}`),
      empty: () => h("button", "Retry"), loading: () => h("p", { role: "status" }, "Fetching")
    } });
    wrappers.push(wrapper);
    expect(wrapper.get("caption").text()).toBe("Custom caption");
    expect(wrapper.findAll("th")[0]!.text()).toContain("Custom Name");
    await wrapper.setProps({ value: [], loading: true });
    expect(wrapper.get(".wl-table__mask").text()).toBe("Fetching");
    expect(wrapper.find(".wl-table__empty-cell").exists()).toBe(false);
    await wrapper.setProps({ loading: false });
    expect(wrapper.get(".wl-table__empty-cell button").text()).toBe("Retry");
  });
});
