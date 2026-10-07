import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    min?: number;
    max?: number;
    step?: number;
    size?: WlSizeSm;
    density?: WlDensity;
    disabled?: boolean;
    invalid?: boolean;
    ariaLabel?: string;
    decrementLabel?: string;
    incrementLabel?: string;
};
type __VLS_PublicProps = {
    modelValue?: number;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: number) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: number) => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    min: number;
    max: number;
    step: number;
    invalid: boolean;
    density: WlDensity;
    decrementLabel: string;
    incrementLabel: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
export default _default;
