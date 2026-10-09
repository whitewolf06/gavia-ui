import { WlCalendarEvent } from '../types';
import { WlNoModelModifiers } from '../model-types';
type __VLS_Props = {
    events?: readonly WlCalendarEvent[];
    modelModifiers?: WlNoModelModifiers;
    monthModifiers?: WlNoModelModifiers;
};
type __VLS_PublicProps = {
    modelValue?: string;
    'modelModifiers'?: Partial<Record<never, true>>;
    "month"?: string;
    'monthModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    events: () => never[];
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
    "update:month": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    events: () => never[];
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    "onUpdate:month"?: ((value: string) => any) | undefined;
}, {
    events: readonly WlCalendarEvent[];
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
