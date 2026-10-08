/** Public collection contracts; typechecking is deferred until explicitly requested. */
import { ref } from "vue";
import { WlMenu, WlAccordion, WlSidebar, WlCommandPalette, WlBreadcrumbs, WlSteps, WlCalendar,
  type WlMenuItem, type WlMenuExpose, type WlAccordionItem, type WlAccordionSlots,
  type WlSidebarItem, type WlSidebarGroup, type WlCommandPaletteItem, type WlCommandPaletteGroup } from "../src";
import Consumer from "./fixtures/collection-contract-consumer.vue";

interface ProjectMenuItem extends WlMenuItem<ProjectMenuItem> { projectId: number; data: { route: string }; }
interface Section extends WlAccordionItem<"details" | "history"> { data: { count: number }; }
interface NavItem extends WlSidebarItem<{ route: string }> { key: "docs" | "font"; data: { route: string }; }
interface NavGroup extends WlSidebarGroup<NavItem> { permission: "read" | "write"; }
interface CommandItem extends WlCommandPaletteItem<{ entityId: number }> { data: { entityId: number }; }
interface CommandGroup extends WlCommandPaletteGroup<CommandItem> { categoryId: number; }
type MenuProps = Parameters<typeof WlMenu<ProjectMenuItem>>[0];
type AccordionProps = Parameters<typeof WlAccordion<Section>>[0];
type SidebarProps = Parameters<typeof WlSidebar<NavItem, NavGroup>>[0];
type PaletteProps = Parameters<typeof WlCommandPalette<CommandItem, CommandGroup>>[0];
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type AccordionUpdate = Expect<Equal<Parameters<NonNullable<AccordionProps["onUpdate:openKeys"]>>[0], Section["key"][]>>;
type SidebarUpdate = Expect<Equal<Parameters<NonNullable<SidebarProps["onUpdate:modelValue"]>>[0], NavItem["key"]>>;
type SidebarInput = Expect<Equal<SidebarProps["modelValue"], NavItem["key"] | undefined>>;
type SidebarContext = NonNullable<ReturnType<typeof WlSidebar<NavItem, NavGroup>>["__ctx"]>;

function sidebarContextTypes(sidebar: SidebarContext): void {
  sidebar.emit("update:modelValue", "font");
  // @ts-expect-error Sidebar emits selected keys, not the absence of an optional input.
  sidebar.emit("update:modelValue", undefined);
  // @ts-expect-error The event cannot widen the consumer's route domain.
  sidebar.emit("update:modelValue", "settings");
}
type SidebarGroupSelect = Expect<Equal<Parameters<NonNullable<SidebarProps["onSelect"]>>[1], NavGroup | undefined>>;
type PaletteGroupSelect = Expect<Equal<Parameters<NonNullable<PaletteProps["onSelect"]>>[1], CommandGroup>>;
type AccordionScope = Parameters<NonNullable<WlAccordionSlots<Section>["item"]>>[0];

export function collectionConsumerTypes(): void {
  const menus: readonly ProjectMenuItem[] = [{ key: "project", label: "Открыть", projectId: 1, data: { route: "/project/1" }, command: (item) => { item.projectId.toFixed(); item.data.route.toUpperCase(); } }];
  const menuProps: MenuProps = { items: menus };
  const legacyMenus: WlMenuItem[] = [{ label: "Legacy", command: (item) => { item.label?.toUpperCase(); void item.command; } }];
  const legacyMenuProps: Parameters<typeof WlMenu<WlMenuItem>>[0] = { items: legacyMenus };
  const menuRef = ref<WlMenuExpose | null>(null);
  menuRef.value?.show(new MouseEvent("click")); menuRef.value?.toggle(); menuRef.value?.hide();
  const sections: readonly Section[] = [{ key: "details", title: "Сведения", data: { count: 1 } }];
  const accordionProps: AccordionProps = { items: sections, openKeys: ["history"], "onUpdate:openKeys": (keys) => { const first: Section["key"] | undefined = keys[0]; void first; } };
  const scope: AccordionScope = { item: sections[0]!, open: true };
  const navGroups: readonly NavGroup[] = [{ id: "main", permission: "read", items: [{ key: "docs", label: "Docs", data: { route: "/docs" } }] }];
  // The key domain includes unloaded routes; membership is not a runtime/type requirement.
  const sidebarProps: SidebarProps = { groups: navGroups, modelValue: "font", onSelect: (item, group) => { item.data.route.toUpperCase(); group?.permission.toUpperCase(); } };
  const commandGroups: readonly CommandGroup[] = [{ id: "main", label: "Projects", categoryId: 1, items: [{ id: "open", label: "Open", data: { entityId: 1 }, keywords: ["open"] }] }];
  const paletteProps: PaletteProps = { groups: commandGroups, queryModifiers: { trim: true }, onSelect: (item, group) => { item.data.entityId.toFixed(); group.categoryId.toFixed(); } };
  // @ts-expect-error Commands receive the same concrete item, not an incompatible payload.
  const wrongMenu: MenuProps = { items: [{ label: "Open", projectId: 1, data: { route: "/" }, command: (item: { projectId: string }) => { void item; } }] };
  // @ts-expect-error Accordion keys come from its item domain.
  const wrongAccordionKey: AccordionProps = { items: sections, openKeys: ["missing"] };
  // @ts-expect-error Accordion updates retain the domain instead of a different key array.
  const wrongAccordionUpdate: AccordionProps = { items: sections, "onUpdate:openKeys": (keys: "missing"[]) => { void keys; } };
  // @ts-expect-error Slot item custom data stays numeric.
  const wrongScope: AccordionScope = { item: { key: "details", title: "Details", data: { count: "one" } }, open: true };
  // @ts-expect-error The model cannot widen the Sidebar's declared key domain.
  const wrongSidebarKey: SidebarProps = { groups: navGroups, modelValue: "settings" };
  // @ts-expect-error Group extras remain required in a concrete Group contract.
  const missingNavGroup: SidebarProps = { groups: [{ id: "main", items: [] }] };
  // @ts-expect-error Group callback metadata remains concrete.
  const wrongGroupListener: PaletteProps = { groups: commandGroups, onSelect: (item, group: { categoryId: string }) => { void item; void group; } };
  // @ts-expect-error Array keys have no trim semantics.
  const accordionTrim: AccordionProps = { openKeysModifiers: { trim: true } };
  // @ts-expect-error Navigation keys must not be coerced to numbers.
  const sidebarNumber: SidebarProps = { modelModifiers: { number: true } };
  // @ts-expect-error Boolean models do not support lazy.
  const sidebarLazy: SidebarProps = { pinnedModifiers: { lazy: true } };
  // @ts-expect-error The mobile boolean model does not support trim.
  const mobileTrim: SidebarProps = { mobileOpenModifiers: { trim: true } };
  // @ts-expect-error Visible is a boolean, not text.
  const visibleTrim: PaletteProps = { visibleModifiers: { trim: true } };
  // @ts-expect-error Query remains string and rejects number coercion.
  const queryNumber: PaletteProps = { queryModifiers: { number: true } };
  const breadcrumbs: InstanceType<typeof WlBreadcrumbs>["$props"] = { items: [{ label: "Home", href: "/" }] as const };
  const steps: InstanceType<typeof WlSteps>["$props"] = { items: [{ label: "Done" }] as const, current: 1 };
  const calendar: InstanceType<typeof WlCalendar>["$props"] = { events: [{ date: "2026-10-08", label: "Release", tone: "blue" }] as const, modelValue: "", month: "" };
  // @ts-expect-error Calendar dates cannot be trimmed/coerced as a model modifier contract.
  const calendarNumber: InstanceType<typeof WlCalendar>["$props"] = { modelModifiers: { number: true } };
  // @ts-expect-error Calendar month is serialized text with no lazy semantics.
  const calendarLazy: InstanceType<typeof WlCalendar>["$props"] = { monthModifiers: { lazy: true } };
  void [sidebarContextTypes, menuProps, legacyMenuProps, menuRef, accordionProps, scope, sidebarProps, paletteProps, wrongMenu, wrongAccordionKey, wrongAccordionUpdate, wrongScope, wrongSidebarKey, missingNavGroup, wrongGroupListener, accordionTrim, sidebarNumber, sidebarLazy, mobileTrim, visibleTrim, queryNumber, breadcrumbs, steps, calendar, calendarNumber, calendarLazy, Consumer];
}
export type CollectionContractAssertions = [AccordionUpdate, SidebarUpdate, SidebarInput, SidebarGroupSelect, PaletteGroupSelect];
