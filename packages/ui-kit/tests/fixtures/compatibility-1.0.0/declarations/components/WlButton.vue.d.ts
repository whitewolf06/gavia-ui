import { WlPt } from "../pt-types.js";
import { WlButtonVariant, WlDensity, WlSize, WlTone } from "../types.js";
type __VLS_Props = {
    /** Visual treatment; inherits an enclosing WlButtonGroup when omitted.
     * @default "secondary"
     */
    variant?: WlButtonVariant;
    /** Semantic color, independent of the visual treatment. */
    tone?: WlTone;
    /** Control size; inherits an enclosing WlButtonGroup when omitted.
     * @default "md"
     */
    size?: WlSize;
    /** Spacing density; inherits an enclosing WlButtonGroup when omitted.
     * @default "default"
     */
    density?: WlDensity;
    /** Display a spinner and prevent activation.
     * @default false
     */
    loading?: boolean;
    /** Prevent pointer and keyboard activation.
     * @default false
     */
    disabled?: boolean;
    /** Fill the available inline width.
     * @default false
     */
    block?: boolean;
    /** Native button type; applies when rendering a button.
     * @default "button"
     */
    type?: "button" | "submit" | "reset";
    /** Render a link explicitly; href or to also selects link rendering. */
    as?: "button" | "a";
    /** Link destination, forwarded to WlLink. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /** Place the icon before or after the default slot.
     * @default "start"
     */
    iconPosition?: "start" | "end";
    /** Attributes for the root, label and loadingIcon pass-through sections. */
    pt?: WlPt<"button">;
};
declare var __VLS_9: {}, __VLS_11: {}, __VLS_13: {};
type __VLS_Slots = {} & {
    icon?: (props: typeof __VLS_9) => any;
} & {
    default?: (props: typeof __VLS_11) => any;
} & {
    icon?: (props: typeof __VLS_13) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    variant: string;
    size: string;
    density: string;
    loading: boolean;
    disabled: boolean;
    block: boolean;
    type: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    click: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    variant: string;
    size: string;
    density: string;
    loading: boolean;
    disabled: boolean;
    block: boolean;
    type: string;
}>>> & {
    onClick?: ((event: MouseEvent) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSize;
    type: "reset" | "button" | "submit";
    loading: boolean;
    block: boolean;
    density: WlDensity;
    variant: WlButtonVariant;
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
