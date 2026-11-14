import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /** Width (CSS). */
    width?: string;
    /** Height (CSS). */
    height?: string;
    /** Radius (CSS). */
    borderRadius?: string;
    /**
     * Shape.
     * @default "rectangle"
     */
    shape?: "rectangle" | "circle";
    /** Apply the text or avatar skeleton presentation. */
    preset?: "text" | "avatar";
    /**
     * Number of placeholder lines in the text preset.
     * @default 1
     */
    lines?: number;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"skeleton">;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    shape: string;
    lines: number;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    shape: string;
    lines: number;
}>>>, {
    shape: "circle" | "rectangle";
    lines: number;
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
