import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    modelModifiers?: WlNoModelModifiers;
    minTime?: string;
    maxTime?: string;
    size?: WlSizeSm;
    density?: WlDensity;
    disabled?: boolean;
    invalid?: boolean;
    pt?: WlPt<"timepicker">;
};
type __VLS_PublicProps = {
    modelValue?: string | null;
    'modelModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string | null) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: string | null) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    invalid: boolean;
    density: WlDensity;
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
