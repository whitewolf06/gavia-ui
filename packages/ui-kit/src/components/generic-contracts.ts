import RawSelect from "./WlSelect.vue";
import RawMultiSelect from "./WlMultiSelect.vue";
import RawAutocomplete from "./WlAutocomplete.vue";
import RawDatePicker from "./WlDatePicker.vue";
import type { WlOptionValueResolver } from "../selection-types";
import type { WlDatePickerSelectionMode, WlTabItem } from "../types";
import type { WlAccordionItem, WlMenuItem, WlMenuItemBase, WlSidebarItem, WlSidebarGroup, WlCommandPaletteItem, WlCommandPaletteGroup } from "../navigation-types";
import type { WlTableRow } from "../table-types";
import type { WlElementAttributes, WlComboboxAttributes, WlInputAttributes, WlDateInputAttributes, WlToggleAttributes } from "../native-types";
import RawRadio from "./WlRadio.vue";
import RawSegmented from "./WlSegmented.vue";
import RawTabs from "./WlTabs.vue";
import RawTable from "./WlTable.vue";
import RawAccordion from "./WlAccordion.vue";
import RawMenu from "./WlMenu.vue";
import RawSidebar from "./WlSidebar.vue";
import RawCommandPalette from "./WlCommandPalette.vue";

type WithNativeAttributes<Props, Attributes> = Props & Omit<Attributes, keyof Props>;

/** Retain every optional Vue context, expose and setup argument from the SFC declaration. */
type VueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;

/** A non-default generic must also be supplied at runtime; unions retain the required property. */
type RuntimeGenericProp<Props, Key extends PropertyKey, Value, Default> = Props &
  ([Value] extends [never] ? { [Prop in Key]: never }
    : [Value] extends [Default] ? unknown : { [Prop in Key]: Value });

// Vue tooling first infers options/resolvers through the component constructor, then checks
// the exact $props. Keeping model inputs out of that inference prevents overload failures
// from hiding a wrong v-model in template diagnostics. These signatures are type-only.
type ModelInferenceProps<Props> = Omit<Props, "modelValue" | "onUpdate:modelValue"> & { modelValue?: unknown; "onUpdate:modelValue"?: unknown };
type GenericInstance<Props, Result extends { __ctx?: unknown }> =
  (NonNullable<Result["__ctx"]> extends { expose(exposed: infer Exposed): void } ? Exposed : {}) & {
  $props: Props;
  $slots: NonNullable<Result["__ctx"]> extends { slots: infer Slots } ? Slots : {};
  $emit: NonNullable<Result["__ctx"]> extends { emit: infer Emit } ? Emit : never;
};

type SelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined> =
  RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type SelectContract = {
  // The inference-only third parameter keeps explicit <Option, Resolver> instantiation
  // on the general signature. The callback constraint supplies its option context.
  new <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver } & ModelInferenceProps<Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">>
  ): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
  new <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & ModelInferenceProps<SelectProps<TOption, TResolver>>
  ): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
  <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver } & Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">,
    ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawSelect<TOption, TResolver>>;
  <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & SelectProps<TOption, TResolver>,
    ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>
  ): ReturnType<typeof RawSelect<TOption, TResolver>>;
};
type MultiSelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined> =
  RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawMultiSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;

type MultiSelectContract = {
  // The inference-only third parameter keeps explicit <Option, Resolver> instantiation
  // on the general signature. The callback constraint supplies its option context.
  new <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver } & ModelInferenceProps<Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">>
  ): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
  new <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(
    props: { options?: readonly TOption[]; optionValue?: TResolver } & ModelInferenceProps<MultiSelectProps<TOption, TResolver>>
  ): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
  <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(
    props: { options?: readonly TOption[]; optionValue: TResolver } & Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">,
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

type SidebarContract = <Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>>(
  props: WithNativeAttributes<Parameters<typeof RawSidebar<Item, Group>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawSidebar<Item, Group>>>
) => ReturnType<typeof RawSidebar<Item, Group>>;
export const WlSidebar = RawSidebar as SidebarContract;

type CommandPaletteContract = <Item extends WlCommandPaletteItem = WlCommandPaletteItem, Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>>(
  props: WithNativeAttributes<Parameters<typeof RawCommandPalette<Item, Group>>[0], WlElementAttributes>,
  ...vue: VueArguments<Parameters<typeof RawCommandPalette<Item, Group>>>
) => ReturnType<typeof RawCommandPalette<Item, Group>>;
export const WlCommandPalette = RawCommandPalette as CommandPaletteContract;
