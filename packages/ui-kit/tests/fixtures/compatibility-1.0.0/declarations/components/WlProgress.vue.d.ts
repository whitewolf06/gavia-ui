import { WlPt } from "../pt-types.js";
import { WlTone } from "../types.js";
type __VLS_Props = {
    /** Current value, clamped to the range from zero to max.
     * @default 0
     */
    value?: number;
    /** Semantic progress color.
     * @default "accent"
     */
    tone?: WlTone;
    /** Positive finite upper bound; invalid values fall back to 100.
     * @default 100
     */
    max?: number;
    /** Show activity without exposing a known current value.
     * @default false
     */
    indeterminate?: boolean;
    /** Accessible name when no external label is referenced. */
    ariaLabel?: string;
    /** ID of the element naming this progress indicator. */
    ariaLabelledby?: string;
    /** Use the thin track treatment.
     * @default false
     */
    thin?: boolean;
    /** Display the percentage for determinate progress.
     * @default false
     */
    showValue?: boolean;
    /** Attributes for the root, value and label sections. */
    pt?: WlPt<"progress">;
};
type __VLS_Slots = {};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    value: number;
    tone: string;
    thin: boolean;
    showValue: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    value: number;
    tone: string;
    thin: boolean;
    showValue: boolean;
}>>>, {
    value: number;
    tone: WlTone;
    thin: boolean;
    showValue: boolean;
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
