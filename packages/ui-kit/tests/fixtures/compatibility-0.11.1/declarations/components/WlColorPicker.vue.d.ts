import { WlColorPickerSize } from '../types';
/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
type __VLS_Props = {
    /** v-model — hex color, always emitted normalized as lowercase #rrggbb. */
    modelValue?: string;
    swatches?: readonly string[];
    size?: WlColorPickerSize;
    disabled?: boolean;
    invalid?: boolean;
    paletteLabel?: string;
    inputLabel?: string;
};
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    modelValue: string;
    swatches: () => string[];
    size: string;
    disabled: boolean;
    invalid: boolean;
    paletteLabel: string;
    inputLabel: string;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    modelValue: string;
    swatches: () => string[];
    size: string;
    disabled: boolean;
    invalid: boolean;
    paletteLabel: string;
    inputLabel: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    disabled: boolean;
    size: WlColorPickerSize;
    invalid: boolean;
    modelValue: string;
    swatches: readonly string[];
    paletteLabel: string;
    inputLabel: string;
}, {}>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_PrettifyLocal<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
