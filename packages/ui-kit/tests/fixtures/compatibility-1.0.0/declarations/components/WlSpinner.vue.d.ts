import { WlSpinnerSize } from "../types.js";
type __VLS_Props = {
    /**
     * Size.
     * @default "md"
     */
    size?: WlSpinnerSize;
    /**
     * Light variant for dark backgrounds.
     * @default false
     */
    light?: boolean;
    /**
     * aria-label; uses locale.loading when omitted or undefined (English: Loading).
     * @default undefined
     */
    label?: string;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    size: string;
    light: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    size: string;
    light: boolean;
}>>>, {
    size: WlSpinnerSize;
    light: boolean;
}, {}>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T & string]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<Required<T>[K]>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_WithDefaults<P, D> = {
    [K in keyof P & string]: K extends keyof D ? __VLS_PrettifyLocal<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
