import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    options?: unknown[];
    optionLabel?: string | ((option: any) => string);
    optionValue?: string | ((option: any) => any);
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    modelValue?: unknown;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: unknown) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: unknown) => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    invalid: boolean;
    density: WlDensity;
    motion: boolean;
    options: unknown[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    root: HTMLDivElement;
    panel: HTMLDivElement;
}, any>;
export default _default;
