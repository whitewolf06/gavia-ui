import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    size?: WlSizeSm;
    density?: WlDensity;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    ariaLabel?: string;
};
type __VLS_PublicProps = {
    modelValue?: string;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    invalid: boolean;
    placeholder: string;
    density: WlDensity;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
export default _default;
