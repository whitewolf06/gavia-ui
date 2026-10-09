import { WlPt } from '../pt-types';
import { WlTextModelModifiers } from '../model-types';
type __VLS_Props = {
    modelModifiers?: WlTextModelModifiers;
    invalid?: boolean;
    disabled?: boolean;
    rows?: number;
    autoResize?: boolean;
    placeholder?: string;
    pt?: WlPt<"textarea">;
};
type __VLS_PublicProps = {
    modelValue?: string;
    'modelModifiers'?: Partial<Record<"trim", true>>;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    invalid: boolean;
    disabled: boolean;
    rows: number;
    autoResize: boolean;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    invalid: boolean;
    disabled: boolean;
    rows: number;
    autoResize: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    disabled: boolean;
    rows: number;
    invalid: boolean;
    autoResize: boolean;
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
