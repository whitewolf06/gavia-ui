import { WlDensity, WlSizeSm } from '../types';
export interface WlAutocompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}
type __VLS_Props = {
    suggestions?: unknown[];
    optionLabel?: string | ((option: any) => string);
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    multiple?: boolean;
    dropdown?: boolean;
    dropdownLabel?: string;
    minLength?: number;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    modelValue?: unknown;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    complete: (event: WlAutocompleteCompleteEvent) => any;
    "update:modelValue": (value: unknown) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onComplete?: ((event: WlAutocompleteCompleteEvent) => any) | undefined;
    "onUpdate:modelValue"?: ((value: unknown) => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    dropdown: boolean;
    multiple: boolean;
    invalid: boolean;
    suggestions: unknown[];
    density: WlDensity;
    dropdownLabel: string;
    minLength: number;
    motion: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    control: HTMLInputElement;
    panel: HTMLDivElement;
}, any>;
export default _default;
