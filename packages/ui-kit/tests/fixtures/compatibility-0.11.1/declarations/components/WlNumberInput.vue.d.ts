import { WlDensity, WlSizeSm } from '../types';
import { WlNoModelModifiers } from '../model-types';
type __VLS_Props = {
    modelModifiers?: WlNoModelModifiers;
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
    'modelModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    decrementLabel: string;
    incrementLabel: string;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: number) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    decrementLabel: string;
    incrementLabel: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: number) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    min: number;
    max: number;
    step: number;
    invalid: boolean;
    density: WlDensity;
    decrementLabel: string;
    incrementLabel: string;
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
