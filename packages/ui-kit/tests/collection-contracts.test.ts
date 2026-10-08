import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { WlMenu, WlAccordion, WlSidebar, WlCommandPalette, WlTable,
  type WlMenuItem, type WlMenuExpose, type WlAccordionItem, type WlSidebarItem,
  type WlSidebarGroup, type WlCommandPaletteItem, type WlCommandPaletteGroup,
  type WlTableColumn } from "../src";

enableAutoUnmount(afterEach);
const global = { stubs: { Teleport: true } };

interface ProjectMenuItem extends WlMenuItem<ProjectMenuItem> { projectId: number; }
interface Section extends WlAccordionItem<"details" | "history"> { data: { count: number }; }
interface NavItem extends WlSidebarItem<{ route: string }> { key: "docs" | "font"; data: { route: string }; }
interface NavGroup extends WlSidebarGroup<NavItem> { permission: string; }
interface CommandItem extends WlCommandPaletteItem<{ entityId: number }> { data: { entityId: number }; }
interface CommandGroup extends WlCommandPaletteGroup<CommandItem> { categoryId: number; }

// These tests protect actual callback/slot identities and DOM fallthrough, not only declarations.
describe("public collection contracts", () => {
  it("passes the original frozen Menu item to its self-typed command", async () => {
    const command = vi.fn<(item: ProjectMenuItem) => void>();
    const item: ProjectMenuItem = Object.freeze({ key: "project", label: "Project", projectId: 1, command });
    const items = Object.freeze([item]);
    const wrapper = mount(WlMenu<ProjectMenuItem>, { global, props: { items } });
    await wrapper.get('[role="menuitem"]').trigger("click");
    expect(command).toHaveBeenCalledTimes(1);
    expect(command).toHaveBeenCalledWith(item);
    expect(command.mock.calls[0]?.[0]).toBe(item);
    expect(items).toEqual([item]);
  });

  it("forwards consumer Menu attrs while retaining pt classes and styles", async () => {
    const wrapper = mount(WlMenu, {
      global,
      props: { popup: true, pt: { root: { class: "configured-menu", style: { color: "red" } } } },
      attrs: { class: "consumer-menu", style: { backgroundColor: "blue" }, "data-consumer": "menu", "aria-describedby": "menu-help" }
    });
    (wrapper.vm as unknown as WlMenuExpose).show();
    await nextTick();
    const root = wrapper.get('[data-wl="menu"]');
    expect(root.classes()).toEqual(expect.arrayContaining(["wl-menu", "configured-menu", "consumer-menu"]));
    expect(root.attributes("data-consumer")).toBe("menu");
    expect(root.attributes("aria-describedby")).toBe("menu-help");
    expect((root.element as HTMLElement).style.color).toBe("red");
    expect((root.element as HTMLElement).style.backgroundColor).toBe("blue");
  });

  it("keeps frozen controlled Accordion keys unchanged and returns the concrete item", async () => {
    const section: Section = Object.freeze({ key: "details", title: "Details", data: { count: 2 } });
    const items = Object.freeze([section]);
    const openKeys = Object.freeze<Section["key"][]>([]);
    const slot = vi.fn((scope: { item: Section; open: boolean }) => h("span", String(scope.item.data.count)));
    const wrapper = mount(WlAccordion<Section>, { props: { items, openKeys }, slots: { item: slot } });
    expect(slot.mock.calls[0]?.[0].item).toBe(section);
    await wrapper.get("summary").trigger("click");
    expect(wrapper.emitted("update:openKeys")?.[0]).toEqual([["details"]]);
    expect(openKeys).toEqual([]);
    expect(items).toEqual([section]);
  });

  it("preserves released Sidebar slot keys and custom group identity", async () => {
    const item: NavItem = Object.freeze({ key: "docs", label: "Docs", data: { route: "/docs" } });
    const group: NavGroup = Object.freeze({ id: "main", permission: "read", items: Object.freeze([item]) });
    const itemSlot = vi.fn((scope: { key: NavItem["key"]; item: NavItem; group: NavGroup; select: () => void }) =>
      h("button", { class: "consumer-item", onClick: scope.select }, `${scope.key}:${scope.group.permission}`));
    const footerSlot = vi.fn((scope: { key: NavItem["key"]; item: NavItem }) => h("span", { class: "consumer-footer" }, scope.key));
    const wrapper = mount(WlSidebar<NavItem, NavGroup>, {
      props: { groups: Object.freeze([group]), footerItems: Object.freeze([item]), modelValue: "font", showPin: false },
      attrs: { class: "consumer-sidebar", style: { color: "red" }, "data-consumer": "sidebar", "aria-describedby": "sidebar-help" },
      slots: { item: itemSlot, "footer-item": footerSlot }
    });
    expect(itemSlot.mock.calls[0]?.[0]).toMatchObject({ key: "docs", item, group });
    expect(itemSlot.mock.calls[0]?.[0].group).toBe(group);
    expect(footerSlot.mock.calls[0]?.[0].key).toBe("docs");
    const root = wrapper.get('[data-wl="sidebar"]');
    expect(root.classes()).toContain("consumer-sidebar");
    expect(root.attributes("data-consumer")).toBe("sidebar");
    expect(root.attributes("aria-describedby")).toBe("sidebar-help");
    expect((root.element as HTMLElement).style.color).toBe("red");
    await wrapper.get(".consumer-item").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["docs"]);
    expect(wrapper.emitted("select")?.[0]?.[0]).toBe(item);
    expect(wrapper.emitted("select")?.[0]?.[1]).toBe(group);
  });

  it("preserves CommandPalette group metadata, frozen keywords and DOM attrs", async () => {
    const item: CommandItem = Object.freeze({ id: "open", label: "Open", data: { entityId: 1 }, keywords: Object.freeze(["project"]) });
    const group: CommandGroup = Object.freeze({ id: "main", label: "Projects", categoryId: 2, items: Object.freeze([item]) });
    const wrapper = mount(WlCommandPalette<CommandItem, CommandGroup>, {
      global,
      props: { visible: true, groups: Object.freeze([group]), closeOnSelect: false },
      attrs: { class: "consumer-palette", style: { color: "blue" }, "data-consumer": "palette", "aria-describedby": "palette-help" },
      slots: { group: (scope: { group: CommandGroup }) => h("span", String(scope.group.categoryId)) }
    });
    const root = wrapper.get('[data-wl="command-palette"]');
    expect(root.classes()).toContain("consumer-palette");
    expect(root.attributes("data-consumer")).toBe("palette");
    expect(root.attributes("aria-describedby")).toBe("palette-help");
    expect((root.element as HTMLElement).style.color).toBe("blue");
    expect(wrapper.get(".wl-command-palette__group-label").text()).toBe("2");
    await wrapper.get('[role="option"]').trigger("click");
    expect(wrapper.emitted("select")?.[0]?.[0]).toBe(item);
    expect(wrapper.emitted("select")?.[0]?.[1]).toBe(group);
    expect(item.keywords).toEqual(["project"]);
  });

  it("keeps explicit virtual Table columns and field values working together", () => {
    interface Row { name: string; score: number; }
    const row: Row = Object.freeze({ name: "Gavia", score: 8 });
    const columns = Object.freeze([{ key: "score", label: "Score" }, { key: "actions", label: "Actions", kind: "virtual" }] as const satisfies readonly WlTableColumn<Row>[]);
    const action = vi.fn((scope: { row: Row; value: unknown }) => h("button", scope.row.name));
    const wrapper = mount(WlTable<Row>, { props: { value: Object.freeze([row]), columns }, slots: { "cell-actions": action } });
    expect(wrapper.get("tbody td").text()).toBe("8");
    expect(action.mock.calls[0]?.[0].row).toBe(row);
    expect(action.mock.calls[0]?.[0].value).toBeUndefined();
    expect(columns).toHaveLength(2);
  });
});
