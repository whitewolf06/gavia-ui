import { WlFileReject } from '../types';
import { WlNoModelModifiers } from '../model-types';
type __VLS_Props = {
    modelModifiers?: WlNoModelModifiers;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    /** Bytes. */
    maxSize?: number;
    disabled?: boolean;
};
type __VLS_PublicProps = {
    modelValue?: File[];
    'modelModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    accept: undefined;
    multiple: boolean;
    maxFiles: undefined;
    maxSize: undefined;
    disabled: boolean;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    reject: (payload: WlFileReject) => void;
    "update:modelValue": (value: File[]) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    accept: undefined;
    multiple: boolean;
    maxFiles: undefined;
    maxSize: undefined;
    disabled: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: File[]) => any) | undefined;
    onReject?: ((payload: WlFileReject) => any) | undefined;
}, {
    accept: string;
    disabled: boolean;
    multiple: boolean;
    maxFiles: number;
    maxSize: number;
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
