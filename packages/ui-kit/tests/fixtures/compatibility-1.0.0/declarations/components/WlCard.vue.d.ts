import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /** Add the theme's hover treatment.
     * @default false
     */
    hoverable?: boolean;
    /** Root element when no link destination is supplied.
     * @default "section"
     */
    as?: "section" | "article" | "div" | "a";
    /** Link destination; selects WlLink as the root. */
    href?: string;
    /** Router destination handled by the configured WlLink adapter. */
    to?: unknown;
    /** Outline or elevation treatment; omission uses the theme default. */
    variant?: "outlined" | "elevated";
    /** Content padding; omission uses the theme default. */
    padding?: "none" | "sm" | "md" | "lg";
    /** Attributes for the card root and its content sections. */
    pt?: WlPt<"card">;
};
declare var __VLS_7: {}, __VLS_9: {}, __VLS_11: {}, __VLS_13: {}, __VLS_15: {};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_7) => any;
} & {
    title?: (props: typeof __VLS_9) => any;
} & {
    subtitle?: (props: typeof __VLS_11) => any;
} & {
    default?: (props: typeof __VLS_13) => any;
} & {
    footer?: (props: typeof __VLS_15) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    hoverable: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    hoverable: boolean;
}>>>, {
    hoverable: boolean;
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
