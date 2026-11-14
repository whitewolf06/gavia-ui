import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /**
     * Main page heading.
     * @default ""
     */
    title?: string;
    /**
     * Short page description.
     * @default ""
     */
    description?: string;
    /**
     * Eyebrow or section context.
     * @default ""
     */
    eyebrow?: string;
    /**
     * Semantic heading level for the page title.
     * @default 1
     */
    headingLevel?: 1 | 2;
    /**
     * Size within the component family's documented scale.
     * @default "lg"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"pageheader">;
};
declare var __VLS_1: {}, __VLS_3: {}, __VLS_11: {}, __VLS_13: {}, __VLS_15: {}, __VLS_17: {}, __VLS_19: {};
type __VLS_Slots = {} & {
    breadcrumbs?: (props: typeof __VLS_1) => any;
} & {
    eyebrow?: (props: typeof __VLS_3) => any;
} & {
    title?: (props: typeof __VLS_11) => any;
} & {
    description?: (props: typeof __VLS_13) => any;
} & {
    meta?: (props: typeof __VLS_15) => any;
} & {
    actions?: (props: typeof __VLS_17) => any;
} & {
    navigation?: (props: typeof __VLS_19) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    title: string;
    description: string;
    eyebrow: string;
    headingLevel: number;
    size: string;
    density: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    title: string;
    description: string;
    eyebrow: string;
    headingLevel: number;
    size: string;
    density: string;
}>>>, {
    size: WlSizeSm;
    title: string;
    density: WlDensity;
    description: string;
    eyebrow: string;
    headingLevel: 1 | 2;
}, {}>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
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
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
