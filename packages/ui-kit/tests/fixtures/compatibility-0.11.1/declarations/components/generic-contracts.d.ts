import { default as RawSelect } from './WlSelect.vue';
import { default as RawMultiSelect } from './WlMultiSelect.vue';
import { default as RawAutocomplete } from './WlAutocomplete.vue';
import { default as RawDatePicker } from './WlDatePicker.vue';
import { WlOptionValueResolver } from '../selection-types';
import { WlDatePickerSelectionMode, WlTabItem } from '../types';
import { WlAccordionItem, WlMenuItem, WlMenuItemBase, WlSidebarItem, WlSidebarGroup, WlCommandPaletteItem, WlCommandPaletteGroup } from '../navigation-types';
import { WlTableRow } from '../table-types';
import { WlElementAttributes, WlComboboxAttributes, WlInputAttributes, WlDateInputAttributes, WlToggleAttributes } from '../native-types';
import { default as RawRadio } from './WlRadio.vue';
import { default as RawSegmented } from './WlSegmented.vue';
import { default as RawTabs } from './WlTabs.vue';
import { default as RawTable } from './WlTable.vue';
import { default as RawAccordion } from './WlAccordion.vue';
import { default as RawMenu } from './WlMenu.vue';
import { default as RawSidebar } from './WlSidebar.vue';
import { default as RawCommandPalette } from './WlCommandPalette.vue';
type WithNativeAttributes<Props, Attributes> = Props & Omit<Attributes, keyof Props>;
/** Retain every optional Vue context, expose and setup argument from the SFC declaration. */
type VueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;
/** A non-default generic must also be supplied at runtime; unions retain the required property. */
type RuntimeGenericProp<Props, Key extends PropertyKey, Value, Default> = Props & ([Value] extends [never] ? {
    [Prop in Key]: never;
} : [Value] extends [Default] ? unknown : {
    [Prop in Key]: Value;
});
type ModelInferenceProps<Props> = Omit<Props, "modelValue" | "onUpdate:modelValue"> & {
    modelValue?: unknown;
    "onUpdate:modelValue"?: unknown;
};
type GenericInstance<Props, Result extends {
    __ctx?: unknown;
}> = (NonNullable<Result["__ctx"]> extends {
    expose(exposed: infer Exposed): void;
} ? Exposed : {}) & {
    $props: Props;
    $slots: NonNullable<Result["__ctx"]> extends {
        slots: infer Slots;
    } ? Slots : {};
    $emit: NonNullable<Result["__ctx"]> extends {
        emit: infer Emit;
    } ? Emit : never;
};
type SelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined> = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;
type SelectContract = {
    new <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(props: {
        options?: readonly TOption[];
        optionValue: TResolver;
    } & ModelInferenceProps<Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">>): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
    new <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(props: {
        options?: readonly TOption[];
        optionValue?: TResolver;
    } & ModelInferenceProps<SelectProps<TOption, TResolver>>): GenericInstance<SelectProps<TOption, TResolver>, ReturnType<typeof RawSelect<TOption, TResolver>>>;
    <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(props: {
        options?: readonly TOption[];
        optionValue: TResolver;
    } & Omit<SelectProps<TOption, TResolver>, "options" | "optionValue">, ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>): ReturnType<typeof RawSelect<TOption, TResolver>>;
    <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(props: {
        options?: readonly TOption[];
        optionValue?: TResolver;
    } & SelectProps<TOption, TResolver>, ...vue: VueArguments<Parameters<typeof RawSelect<TOption, TResolver>>>): ReturnType<typeof RawSelect<TOption, TResolver>>;
};
type MultiSelectProps<TOption, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined> = RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawMultiSelect<TOption, TResolver>>[0], WlComboboxAttributes>, "optionValue", TResolver, undefined>;
type MultiSelectContract = {
    new <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(props: {
        options?: readonly TOption[];
        optionValue: TResolver;
    } & ModelInferenceProps<Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">>): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
    new <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(props: {
        options?: readonly TOption[];
        optionValue?: TResolver;
    } & ModelInferenceProps<MultiSelectProps<TOption, TResolver>>): GenericInstance<MultiSelectProps<TOption, TResolver>, ReturnType<typeof RawMultiSelect<TOption, TResolver>>>;
    <TOption, TResolver extends (option: NoInfer<TOption>) => unknown, CallbackInference extends never>(props: {
        options?: readonly TOption[];
        optionValue: TResolver;
    } & Omit<MultiSelectProps<TOption, TResolver>, "options" | "optionValue">, ...vue: VueArguments<Parameters<typeof RawMultiSelect<TOption, TResolver>>>): ReturnType<typeof RawMultiSelect<TOption, TResolver>>;
    <TOption = unknown, const TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(props: {
        options?: readonly TOption[];
        optionValue?: TResolver;
    } & MultiSelectProps<TOption, TResolver>, ...vue: VueArguments<Parameters<typeof RawMultiSelect<TOption, TResolver>>>): ReturnType<typeof RawMultiSelect<TOption, TResolver>>;
};
type AutocompleteContract = <TOption = unknown, TMultiple extends boolean = false>(props: RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawAutocomplete<TOption, TMultiple>>[0], WlInputAttributes>, "multiple", TMultiple, false>, ...vue: VueArguments<Parameters<typeof RawAutocomplete<TOption, TMultiple>>>) => ReturnType<typeof RawAutocomplete<TOption, TMultiple>>;
type DatePickerContract = {
    <Mode extends WlDatePickerSelectionMode = "single">(props: RuntimeGenericProp<WithNativeAttributes<Parameters<typeof RawDatePicker<Mode>>[0], WlDateInputAttributes>, "selectionMode", Mode, "single">, ...vue: VueArguments<Parameters<typeof RawDatePicker<Mode>>>): ReturnType<typeof RawDatePicker<Mode>>;
    (props: WithNativeAttributes<Parameters<typeof RawDatePicker<"single">>[0], WlDateInputAttributes>, ...vue: VueArguments<Parameters<typeof RawDatePicker<"single">>>): ReturnType<typeof RawDatePicker<"single">>;
};
export declare const WlSelect: SelectContract;
export declare const WlMultiSelect: MultiSelectContract;
export declare const WlAutocomplete: AutocompleteContract;
export declare const WlDatePicker: DatePickerContract;
type RadioContract = <Value = unknown>(props: WithNativeAttributes<Parameters<typeof RawRadio<Value>>[0], WlToggleAttributes>, ...vue: VueArguments<Parameters<typeof RawRadio<Value>>>) => ReturnType<typeof RawRadio<Value>>;
export declare const WlRadio: RadioContract;
type SegmentedContract = <Value extends string = string>(props: WithNativeAttributes<Parameters<typeof RawSegmented<Value>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawSegmented<Value>>>) => ReturnType<typeof RawSegmented<Value>>;
export declare const WlSegmented: SegmentedContract;
type TabsContract = <Item extends WlTabItem = WlTabItem>(props: WithNativeAttributes<Parameters<typeof RawTabs<Item>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawTabs<Item>>>) => ReturnType<typeof RawTabs<Item>>;
export declare const WlTabs: TabsContract;
type TableContract = <Row extends object = WlTableRow>(props: WithNativeAttributes<Parameters<typeof RawTable<Row>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawTable<Row>>>) => ReturnType<typeof RawTable<Row>>;
export declare const WlTable: TableContract;
type AccordionContract = <Item extends WlAccordionItem = WlAccordionItem>(props: WithNativeAttributes<Parameters<typeof RawAccordion<Item>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawAccordion<Item>>>) => ReturnType<typeof RawAccordion<Item>>;
export declare const WlAccordion: AccordionContract;
type MenuContract = <Item extends WlMenuItemBase = WlMenuItem>(props: WithNativeAttributes<Parameters<typeof RawMenu<Item>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawMenu<Item>>>) => ReturnType<typeof RawMenu<Item>>;
export declare const WlMenu: MenuContract;
type SidebarContract = <Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>>(props: WithNativeAttributes<Parameters<typeof RawSidebar<Item, Group>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawSidebar<Item, Group>>>) => ReturnType<typeof RawSidebar<Item, Group>>;
export declare const WlSidebar: SidebarContract;
type CommandPaletteContract = <Item extends WlCommandPaletteItem = WlCommandPaletteItem, Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>>(props: WithNativeAttributes<Parameters<typeof RawCommandPalette<Item, Group>>[0], WlElementAttributes>, ...vue: VueArguments<Parameters<typeof RawCommandPalette<Item, Group>>>) => ReturnType<typeof RawCommandPalette<Item, Group>>;
export declare const WlCommandPalette: CommandPaletteContract;
export {};
