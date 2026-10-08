/** Compile-only navigation/model contracts; checks are deferred until the user's release command. */
import { ref } from "vue";
import {
  WlRadio, WlSegmented, WlTabs, WlSidebar, WlCommandPalette,
  type WlSegmentedOption, type WlTabItem, type WlSidebarItem, type WlSidebarGroup,
  type WlCommandPaletteItem, type WlCommandPaletteGroup,
  type WlSidebarExpose, type WlCommandPaletteExpose
} from "../src";
import Consumer from "./fixtures/navigation-contract-consumer.vue";

type Choice = "team" | "private";
type TabKey = "overview" | "history";
interface TabItem extends WlTabItem<TabKey> { description: string; }
interface SidebarItem extends WlSidebarItem<{ route: string; priority: number }> {
  key: "docs" | "font";
  data: { route: string; priority: number };
  testId: string;
}
interface CommandItem extends WlCommandPaletteItem<{ entityId: number }> {
  data: { entityId: number };
  action: "open" | "edit";
}

type RadioProps = Parameters<typeof WlRadio<Choice>>[0];
type NullableRadioProps = Parameters<typeof WlRadio<Choice | null>>[0];
type SegmentedProps = Parameters<typeof WlSegmented<Choice>>[0];
type TabsProps = Parameters<typeof WlTabs<TabItem>>[0];
type SidebarProps = Parameters<typeof WlSidebar<SidebarItem>>[0];
type CommandProps = Parameters<typeof WlCommandPalette<CommandItem>>[0];
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type RadioUpdate = Expect<Equal<Parameters<NonNullable<RadioProps["onUpdate:modelValue"]>>[0], Choice>>;
type NullableRadioUpdate = Expect<Equal<Parameters<NonNullable<NullableRadioProps["onUpdate:modelValue"]>>[0], Choice | null>>;
type OptionalRadioInput = Expect<Equal<RadioProps["modelValue"], Choice | undefined>>;
type RadioContext = NonNullable<ReturnType<typeof WlRadio<Choice>>["__ctx"]>;
type UndefinedRadioContext = NonNullable<ReturnType<typeof WlRadio<Choice | undefined>>["__ctx"]>;

function radioContextTypes(radio: RadioContext, explicitUndefinedChoice: UndefinedRadioContext): void {
  radio.emit("update:modelValue", "team");
  explicitUndefinedChoice.emit("update:modelValue", undefined);
  // @ts-expect-error Undefined input absence does not widen the emitted choice domain.
  radio.emit("update:modelValue", undefined);
  // @ts-expect-error The callback event uses the same concrete choice as the public props.
  radio.emit("update:modelValue", "public");
}
type SegmentedUpdate = Expect<Equal<Parameters<NonNullable<SegmentedProps["onUpdate:modelValue"]>>[0], Choice | null>>;
type TabsUpdate = Expect<Equal<Parameters<NonNullable<TabsProps["onUpdate:modelValue"]>>[0], TabKey | "">>;
type SidebarSelect = Expect<Equal<Parameters<NonNullable<SidebarProps["onSelect"]>>[0], SidebarItem>>;
type CommandSelect = Expect<Equal<Parameters<NonNullable<CommandProps["onSelect"]>>[0], CommandItem>>;

export function navigationConsumerTypes(): void {
  const radio = ref<Choice | undefined>("team");
  const nullableRadio = ref<Choice | null | undefined>(null);
  const segmented = ref<Choice | null>(null);
  const tabs = ref<TabKey | "">("");
  const options = [{ label: "Команда", value: "team" }, { label: "Лично", value: "private" }] as const satisfies readonly WlSegmentedOption<Choice>[];
  const tabItems: readonly TabItem[] = [{ key: "overview", label: "Обзор", description: "Описание проекта" }];
  const sidebarGroups: readonly WlSidebarGroup<SidebarItem>[] = [{ id: "main", items: [{ key: "docs", label: "Документация", data: { route: "/docs", priority: 1 }, testId: "docs-link" }] }] as const satisfies readonly WlSidebarGroup<SidebarItem>[];
  const commandGroups = [{ id: "main", label: "Проекты", items: [{ id: "open", label: "Открыть", keywords: ["project", "open"], action: "open", data: { entityId: 1 } }] }] as const satisfies readonly WlCommandPaletteGroup<CommandItem>[];
  const radioProps: RadioProps = { value: "team", modelValue: radio.value, "onUpdate:modelValue": (value) => { radio.value = value; } };
  const nullableRadioProps: NullableRadioProps = { value: "private", modelValue: nullableRadio.value, "onUpdate:modelValue": (value) => { nullableRadio.value = value; } };
  const segmentedProps: SegmentedProps = { options, modelValue: segmented.value, "onUpdate:modelValue": (value) => { segmented.value = value; } };
  const tabsProps: TabsProps = { items: tabItems, modelValue: tabs.value, "onUpdate:modelValue": (value) => { tabs.value = value; } };
  const sidebarProps: SidebarProps = { groups: sidebarGroups, onSelect: (item, group) => { item.data.priority.toFixed(); item.testId.toUpperCase(); group?.items[0]?.data.route.toUpperCase(); } };
  const commandProps: CommandProps = { groups: commandGroups, onSelect: (item, group) => { item.data.entityId.toFixed(); item.action.toUpperCase(); group.items[0]?.data.entityId.toFixed(); } };
  // @ts-expect-error A radio choice must fit the model's declared domain.
  const badRadio: RadioProps = { value: "public", modelValue: "team" };
  // @ts-expect-error A nonnullable radio does not invent a null update payload.
  const badRadioUpdate: RadioProps = { value: "team", "onUpdate:modelValue": (value: number) => { void value; } };
  // @ts-expect-error Segmented model values are constrained by the chosen domain.
  const badSegmented: SegmentedProps = { options, modelValue: "public" };
  // @ts-expect-error The nullable Segmented contract cannot be handled by a nonnullable listener.
  const badSegmentedListener: SegmentedProps = { options, "onUpdate:modelValue": (value: Choice) => { void value; } };
  // @ts-expect-error Tabs only accept item keys or the existing empty sentinel.
  const badTabs: TabsProps = { items: tabItems, modelValue: "settings" };
  // @ts-expect-error Tabs retain the empty default sentinel in updates.
  const badTabsListener: TabsProps = { items: tabItems, "onUpdate:modelValue": (value: TabKey) => { void value; } };
  // @ts-expect-error Sidebar data keeps the consumer's numeric priority contract.
  const badSidebar: SidebarProps = { groups: [{ id: "main", items: [{ key: "docs", label: "Docs", data: { route: "/docs", priority: "high" }, testId: "docs-link" }] }] };
  // @ts-expect-error A select listener must accept the real Sidebar item shape.
  const badSidebarListener: SidebarProps = { groups: sidebarGroups, onSelect: (item: { data: { route: number } }) => { void item; } };
  // @ts-expect-error Command item data is numeric; it is not erased to unknown/any.
  const badCommand: CommandProps = { groups: [{ id: "main", label: "Projects", items: [{ id: "open", label: "Open", action: "open", data: { entityId: "one" } }] }] };
  // @ts-expect-error A command listener must accept the consumer's item type.
  const badCommandListener: CommandProps = { groups: commandGroups, onSelect: (item: { action: number }) => { void item; } };
  const legacyOptions: WlSegmentedOption[] = [{ value: "any-string", label: "Legacy" }];
  const legacyTabs: WlTabItem[] = [{ key: "any-string", label: "Legacy" }];
  const legacySidebar: WlSidebarGroup[] = [{ id: "legacy", items: [{ key: "docs", label: "Docs" }] }];
  const legacyCommands: WlCommandPaletteGroup[] = [{ id: "legacy", label: "Legacy", items: [{ id: "open", label: "Open" }] }];
  const legacySegmentedProps: Parameters<typeof WlSegmented<string>>[0] = { options: legacyOptions, modelValue: "any-string" };
  const legacyTabsProps: Parameters<typeof WlTabs<WlTabItem>>[0] = { items: legacyTabs, modelValue: "any-string" };
  const legacySidebarProps: Parameters<typeof WlSidebar<WlSidebarItem>>[0] = { groups: legacySidebar };
  const legacyCommandProps: Parameters<typeof WlCommandPalette<WlCommandPaletteItem>>[0] = { groups: legacyCommands };
  const sidebarRef = ref<WlSidebarExpose | null>(null);
  sidebarRef.value?.openMobile(); sidebarRef.value?.closeMobile(); sidebarRef.value?.togglePinned();
  const commandRef = ref<WlCommandPaletteExpose | null>(null);
  commandRef.value?.focus(); commandRef.value?.open(); commandRef.value?.close();
  // @ts-expect-error Only documented Sidebar methods are exposed publicly.
  sidebarRef.value?.openDesktop();
  // @ts-expect-error Only documented CommandPalette methods are exposed publicly.
  commandRef.value?.search("project");
  void [radioContextTypes, radioProps, nullableRadioProps, segmentedProps, tabsProps, sidebarProps, commandProps, badRadio, badRadioUpdate, badSegmented, badSegmentedListener, badTabs, badTabsListener, badSidebar, badSidebarListener, badCommand, badCommandListener, legacySegmentedProps, legacyTabsProps, legacySidebarProps, legacyCommandProps, Consumer];
}

export type NavigationContractAssertions = [RadioUpdate, NullableRadioUpdate, OptionalRadioInput, SegmentedUpdate, TabsUpdate, SidebarSelect, CommandSelect];
