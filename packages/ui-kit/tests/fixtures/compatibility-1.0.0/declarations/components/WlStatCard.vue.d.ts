import { WlIconInput, WlStatCardTone } from "../types.js";
type __VLS_Props = {
    /** Label icon. */
    icon?: WlIconInput;
    /** Metric label. */
    label?: string;
    /** Value (when no slot is provided). */
    value?: string | number;
    /** Intl.NumberFormat options for the displayed numeric value. */
    numberFormat?: Intl.NumberFormatOptions;
    /** Locale override for numeric display formatting. */
    locale?: string;
    /** Numeric change displayed beside the primary statistic. */
    delta?: string;
    /** Description below the value. */
    description?: string;
    /** Progress from 0 to 100. Displays an indicator when set. */
    progress?: number;
    /**
     * Accent tone.
     * @default "accent"
     */
    tone?: WlStatCardTone;
};
type __VLS_Slots = {
    /** Custom content instead of value. */
    default?(props: {}): unknown;
    /** Card footer. */
    footer?(props: {}): unknown;
    /** Custom statistic delta content; receives the displayed delta text. */
    delta?(props: {
        delta: string | undefined;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
}>>>, {
    tone: import("../index.js").WlTone;
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
