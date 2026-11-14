import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /**
     * Current page number, starting at 1.
     * @default 1
     */
    page?: number;
    /** Total pages. */
    pageCount?: number;
    /** Number of rows displayed on a page. */
    pageSize?: number;
    /** Available page-size choices. */
    pageSizes?: readonly number[];
    /** Total number of data rows used to calculate pagination. */
    total?: number;
    /**
     * Number of pages shown around the current page.
     * @default 1
     */
    siblings?: number;
    /**
     * Compact view with an input.
     * @default false
     */
    compact?: boolean;
    /**
     * Disables navigation.
     * @default false
     */
    disabled?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"pagination">;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    page: number;
    siblings: number;
    compact: boolean;
    disabled: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:page": (value: number) => void;
    "update:pageSize": (value: number) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    page: number;
    siblings: number;
    compact: boolean;
    disabled: boolean;
}>>> & {
    "onUpdate:page"?: ((value: number) => any) | undefined;
    "onUpdate:pageSize"?: ((value: number) => any) | undefined;
}, {
    disabled: boolean;
    compact: boolean;
    page: number;
    siblings: number;
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
