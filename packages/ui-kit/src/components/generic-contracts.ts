import type { WlComboboxAttributes, WlDateInputAttributes, WlElementAttributes, WlInputAttributes, WlToggleAttributes } from "../native-types";
import type { WlAccordionItem, WlCommandPaletteGroup, WlCommandPaletteItem, WlMenuItem, WlMenuItemBase, WlSidebarGroup, WlSidebarItem } from "../navigation-types";
import type { WlOptionGroupChildrenResolver, WlOptionLeaf, WlOptionValueResolver } from "../selection-types";
import type { WlTableRow } from "../table-types";
import type { WlDatePickerSelectionMode, WlTabItem } from "../types";
import RawAccordion from "./WlAccordion.vue";
import RawAutocomplete from "./WlAutocomplete.vue";
import RawCalendar from "./WlCalendar.vue";
import RawCommandPalette from "./WlCommandPalette.vue";
import RawContextMenu from "./WlContextMenu.vue";
import RawDatePicker from "./WlDatePicker.vue";
import RawMenu from "./WlMenu.vue";
import RawMultiSelect from "./WlMultiSelect.vue";
import RawRadio from "./WlRadio.vue";
import RawSegmented from "./WlSegmented.vue";
import RawSelect from "./WlSelect.vue";
import RawSidebar from "./WlSidebar.vue";
import RawTable from "./WlTable.vue";
import RawTabs from "./WlTabs.vue";

type WithNativeAttributes<Props, Attributes> = Props & Omit<Attributes, keyof Props>;

/** Retain every optional Vue context, expose and setup argument from the SFC declaration. */
type VueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;

/** A non-default generic must also be supplied at runtime; unions retain the required property. */
type RuntimeGenericProp<Props, Key extends PropertyKey, Value, Default> = Props
  & ([Value] extends [never] ? { [Prop in Key]: never }
    : [Value] extends [Default] ? unknown : { [Prop in Key]: Value });

// Vue tooling first infers options/resolvers through the component constructor, then checks
// the exact $props. Keeping model inputs out of that inference prevents overload failures
// from hiding a wrong v-model in template diagnostics. These signatures are type-only.
type ModelInferenceProps<Props> = Omit<Props, "modelValue" | "onUpdate:modelValue"> & { modelValue?: unknown; "onUpdate:modelValue"?: unknown };
type GenericInstance<Props, Result extends { __ctx?: unknown }>
  = (NonNullable<Result["__ctx"]> extends { expose(exposed: infer Exposed): void } ? Exposed : {}) & {
    $props: Props;
    $slots: NonNullable<Result["__ctx"]> extends { slots: infer Slots } ? Slots : {};
    $emit: NonNullable<Result["__ctx"]> extends { emit: infer Emit } ? Emit : never;
  };

type SelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined>
  = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type GroupSelectProps<TSource, TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined,
  TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>>>
  = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawSelect<TSource, TResolver, TChildren>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type SelectContract = {
  new<TSource, const TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined = undefined,
    const TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>> = never>(
    props: { options?: readonly TSource[]; optionGroupChildren: TChildren; optionValue?: TResolver }
      & ModelInferenceProps<GroupSelectProps<TSource, TResolver, TChildren>>
  ): GenericInstance<GroupSelectProps<TSource, TResolver, TChildren>, ReturnType<typeof RawSelect<TSource, TResolver, TChildren>>>;
  // Inference-only parameters keep explicit two/three-argument instantiation on the
  // general/grouped signatures. The callback constraint supplies its option context.
  new<TOption, TResolver extends (option: NoInfer<TOption>) => unknown, TNoGroups extends undefined, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver; optionGroupChildren?: TNoGroups } & ModelInferenceProps<Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">>
  ): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
  new<TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & ModelInferenceProps<SelectProps<TOption, TResolver>>
  ): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
  <TSource, const TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined = undefined,
    const TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>> = never>(
    props: { options?: readonly TSource[]; optionGroupChildren: TChildren; optionValue?: TResolver }
      & GroupSelectProps<TSource, TResolver, TChildren>,
    ...vue: VueArguments<Parameters<typeof RawSelect<TSource, TResolver, TChildren>>>
  ): ReturnType<typeof RawSelect<TSource, TResolver, TChildren>>;
  <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, TNoGroups extends undefined, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver; optionGroupChildren?: TNoGroups } & Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">,
    ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawSelect<TOption, TResolver>>;
  <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & SelectProps<TOption, TResolver>,
    ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawSelect<TOption, TResolver>>;
};
type MultiSelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined>
  = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawMultiSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type GroupMultiSelectProps<TSource, TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined,
  TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>>>
  = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawMultiSelect<TSource, TResolver, TChildren>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type MultiSelectContract = {
  new<TSource, const TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined = undefined,
    const TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>> = never>(
    props: { options?: readonly TSource[]; optionGroupChildren: TChildren; optionValue?: TResolver }
      & ModelInferenceProps<GroupMultiSelectProps<TSource, TResolver, TChildren>>
  ): GenericInstance<
    GroupMultiSelectProps<TSource, TResolver, TChildren>,
    ReturnType<typeof RawMultiSelect<TSource, TResolver, TChildren>>
  >;
  // Inference-only parameters keep explicit two/three-argument instantiation on the
  // general/grouped signatures. The callback constraint supplies its option context.
  new<TOption, TResolver extends (option: NoInfer<TOption>) => unknown, TNoGroups extends undefined, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver; optionGroupChildren?: TNoGroups } & ModelInferenceProps<Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">>
  ): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
  new<TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & ModelInferenceProps<MultiSelectProps<TOption, TResolver>>
  ): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
  <TSource, const TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TSource, TChildren>>> | undefined = undefined,
    const TChildren extends WlOptionGroupChildrenResolver<NoInfer<TSource>> = never>(
    props: { options?: readonly TSource[]; optionGroupChildren: TChildren; optionValue?: TResolver }
      & GroupMultiSelectProps<TSource, TResolver, TChildren>,
    ...vue: VueArguments<Parameters<typeof RawMultiSelect<TSource, TResolver, TChildren>>>
  ): ReturnType<typeof RawMultiSelect<TSource, TResolver, TChildren>>;
  <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, TNoGroups extends undefined, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver; optionGroupChildren?: TNoGroups } & Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">,
    ...vue: VueArguments<Parameters<typeof RawMultiSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawMultiSelect<TOption, TResolver>>;
  <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & MultiSelectProps<TOption, TResolver>,
    ...vue: VueArguments<Parameters<typeof RawMultiSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawMultiSelect<TOption, TResolver>>;
};
type AutocompleteContract = <TOption = unknown, TMultiple extends boolean = false>(
  props: RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawAutocomplete<TOption, TMultiple>>[0], WlInputAttributes>, "multiple", TMultiple, false>,
  ...vue: VueArguments<Parameters<typeof RawAutocomplete<TOption, TMultiple>>>
) => ReturnType<typeof RawAutocomplete<TOption, TMultiple>>;

type DatePickerContract = {
  <Mode extends WlDatePickerSelectionMode = "single">(
    props: RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawDatePicker<Mode>>[0], WlDateInputAttributes>, "selectionMode", Mode, "single">,
    ...vue: VueArguments<Parameters<typeof RawDatePicker<Mode>>>
  ): ReturnType<typeof RawDatePicker<Mode>>;
  // Type utilities and mount helpers see the same safe single default as runtime.
  // Explicit generic instantiation retains the generic overload and its required mode.
  (
    props: WithNativeAttributes<Parameters<typeof RawDatePicker<"single">>[0], WlDateInputAttributes>,
    ...vue: VueArguments<Parameters<typeof RawDatePicker<"single">>>
  ): ReturnType<typeof RawDatePicker<"single">>;
};

// These are the original SFC objects, without rendering wrappers or new runtime behavior.
// Vue's generated declarations keep generic props optional; the public view requires
// the corresponding prop when a consumer explicitly selects a non-default generic.
export const WlSelect = RawSelect as unknown as SelectContract;
export const WlMultiSelect = RawMultiSelect as unknown as MultiSelectContract;
export const WlAutocomplete = RawAutocomplete as AutocompleteContract;
export const WlDatePicker = RawDatePicker as DatePickerContract;

type CalendarProps<Multiple extends boolean> = RuntimeGenericProp<
  WithNativeAttributes<Parameters<typeof RawCalendar<Multiple>>[0], WlElementAttributes>, "multiple", Multiple, false
>;
type CalendarContract = {
  new<Multiple extends boolean = false>(
    props: ModelInferenceProps<CalendarProps<Multiple>>
  ): GenericInstance<CalendarProps<Multiple>, ReturnType<typeof RawCalendar<Multiple>>>;
  new(props: ModelInferenceProps<CalendarProps<false>>): GenericInstance<CalendarProps<false>, ReturnType<typeof RawCalendar<false>>>;
  <Multiple extends boolean = false>(
    props: CalendarProps<Multiple>,
    ...vue: VueArguments<Parameters<typeof RawCalendar<Multiple>>>
  ): ReturnType<typeof RawCalendar<Multiple>>;
  (props: CalendarProps<false>, ...vue: VueArguments<Parameters<typeof RawCalendar<false>>>): ReturnType<typeof RawCalendar<false>>;
};
export const WlCalendar = RawCalendar as unknown as CalendarContract;

type RadioContract = <Value = unknown>(
  props: WithNativeAttributes<Parameters<typeof RawRadio<Value>>[0], WlToggleAttributes>,
  ...vue: VueArguments<Parameters<typeof RawRadio<Value>>>
) => ReturnType<typeof RawRadio<Value>>;
export const WlRadio = RawRadio as RadioContract;

type SegmentedContract = <Value extends string = string>(
  props: WithNativeAttributes<Parameters<typeof RawSegmented<Value>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawSegmented<Value>>>
) => ReturnType<typeof RawSegmented<Value>>;
export const WlSegmented = RawSegmented as SegmentedContract;

type TabsContract = <Item extends WlTabItem = WlTabItem>(
  props: WithNativeAttributes<Parameters<typeof RawTabs<Item>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawTabs<Item>>>
) => ReturnType<typeof RawTabs<Item>>;
export const WlTabs = RawTabs as TabsContract;

type TableContract = <Row extends object = WlTableRow>(
  props: WithNativeAttributes<Parameters<typeof RawTable<Row>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawTable<Row>>>
) => ReturnType<typeof RawTable<Row>>;
export const WlTable = RawTable as TableContract;

type AccordionContract = <Item extends WlAccordionItem = WlAccordionItem>(
  props: WithNativeAttributes<Parameters<typeof RawAccordion<Item>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawAccordion<Item>>>
) => ReturnType<typeof RawAccordion<Item>>;
export const WlAccordion = RawAccordion as AccordionContract;

type MenuContract = <Item extends WlMenuItemBase = WlMenuItem>(
  props: WithNativeAttributes<Parameters<typeof RawMenu<Item>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawMenu<Item>>>
) => ReturnType<typeof RawMenu<Item>>;
export const WlMenu = RawMenu as MenuContract;

type ContextMenuContract = <Item extends WlMenuItemBase = WlMenuItem>(
  props: WithNativeAttributes<Parameters<typeof RawContextMenu<Item>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawContextMenu<Item>>>
) => ReturnType<typeof RawContextMenu<Item>>;
export const WlContextMenu = RawContextMenu as ContextMenuContract;

type SidebarContract = <Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>>(
  props: WithNativeAttributes<Parameters<typeof RawSidebar<Item, Group>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawSidebar<Item, Group>>>
) => ReturnType<typeof RawSidebar<Item, Group>>;
export const WlSidebar = RawSidebar as SidebarContract;

type CommandPaletteContract = <
  Item extends WlCommandPaletteItem = WlCommandPaletteItem,
  Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>
>(
  props: WithNativeAttributes<Parameters<typeof RawCommandPalette<Item, Group>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawCommandPalette<Item, Group>>>
) => ReturnType<typeof RawCommandPalette<Item, Group>>;
export const WlCommandPalette = RawCommandPalette as CommandPaletteContract;
