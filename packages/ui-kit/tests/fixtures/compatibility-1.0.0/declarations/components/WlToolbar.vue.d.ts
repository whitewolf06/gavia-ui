import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /**
     * Layout direction and applicable arrow-key navigation direction.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    /**
     * Wrap arrow-key focus navigation at the first and last items.
     * @default true
     */
    loop?: boolean;
    /**
     * Visual treatment within this component family.
     * @default "default"
     */
    variant?: "default";
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"toolbar">;
};
type __VLS_Slots = {
    /** Toolbar controls participating in the shared arrow-key focus navigation. */
    default?(props: Record<never, never>): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    orientation: string;
    loop: boolean;
    variant: string;
    size: string;
    density: string;
    disabled: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    orientation: string;
    loop: boolean;
    variant: string;
    size: string;
    density: string;
    disabled: boolean;
}>>>, {
    disabled: boolean;
    size: WlSizeSm;
    density: WlDensity;
    orientation: "horizontal" | "vertical";
    variant: "default";
    loop: boolean;
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
