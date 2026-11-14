import { WlPt } from "../pt-types.js";
import { WlTone } from "../types.js";
type __VLS_Props = {
    /** Text or count shown when dot is false. */
    value?: string | number;
    /** Semantic badge color.
     * @default "accent"
     */
    tone?: WlTone;
    /** Display numeric values above this limit as a capped count. */
    max?: number;
    /** Accessible label; required for a meaningful dot indicator. */
    ariaLabel?: string;
    /** Show a dot instead of the value; unlabeled dots are decorative.
     * @default false
     */
    dot?: boolean;
    /** Attributes for the badge root section. */
    pt?: WlPt<"badge">;
};
type __VLS_Slots = {
    /** Custom badge content with the original and displayed values. */
    default?(props: {
        value: string | number | undefined;
        displayValue: string | number | undefined;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
    dot: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
    dot: boolean;
}>>>, {
    tone: WlTone;
    dot: boolean;
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
