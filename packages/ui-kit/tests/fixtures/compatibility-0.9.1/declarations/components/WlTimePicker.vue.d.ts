import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    minTime?: string;
    maxTime?: string;
    size?: WlSizeSm;
    density?: WlDensity;
    disabled?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    modelValue?: string | null;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string | null) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | null) => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    invalid: boolean;
    density: WlDensity;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    control: HTMLInputElement;
}, any>;
export default _default;
