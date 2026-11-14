import { WlPt } from "../pt-types.js";
import { WlDensity, WlIconInput, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Item text (when no slot is provided). */
    label?: string;
    /** Leading icon. */
    icon?: WlIconInput;
    /** Trailing badge: number | string. */
    badge?: number | string;
    /**
     * Current item (aria-current=page).
     * @default false
     */
    active?: boolean;
    /**
     * Disables the item.
     * @default false
     */
    disabled?: boolean;
    /** Uses <a> with href, otherwise <button>. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /**
     * Hides the label and badge while preserving the item's accessible name.
     * @default false
     */
    collapsed?: boolean;
    /** Overrides the item's accessible name. */
    ariaLabel?: string;
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
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"navitem">;
};
type __VLS_Slots = {
    /** Custom text instead of label. */
    default?(props: Record<never, never>): unknown;
    /** Custom icon content. */
    icon?(props: {
        icon: WlIconInput | undefined;
    }): unknown;
    /** Custom navigation badge content. */
    badge?(props: {
        badge: string | number | undefined;
        collapsed: boolean;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    active: boolean;
    disabled: boolean;
    collapsed: boolean;
    size: string;
    density: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    click: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    active: boolean;
    disabled: boolean;
    collapsed: boolean;
    size: string;
    density: string;
}>>> & {
    onClick?: ((event: MouseEvent) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    active: boolean;
    density: WlDensity;
    collapsed: boolean;
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
