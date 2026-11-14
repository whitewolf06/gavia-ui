import { WlNoModelModifiers } from "../model-types.js";
import { WlFilterBarSlots } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity } from "../types.js";
type __VLS_Props = {
    /**
     * Number of active filters.
     * @default 0
     */
    activeCount?: number;
    /** Modifier contract for open state; built-in modifiers are unsupported. */
    openModifiers?: WlNoModelModifiers;
    /**
     * Accessible name; uses locale.filters when omitted or undefined (English: Filters).
     * @default undefined
     */
    ariaLabel?: string;
    /**
     * Toggle text; uses locale.filters when omitted or undefined (English: Filters).
     * @default undefined
     */
    toggleLabel?: string;
    /**
     * Mobile panel title; uses locale.filters when omitted or undefined (English: Filters).
     * @default undefined
     */
    panelTitle?: string;
    /**
     * Clear action text; uses locale.reset when omitted or undefined (English: Reset).
     * @default undefined
     */
    clearLabel?: string;
    /**
     * Apply action text; uses locale.apply when omitted or undefined (English: Apply).
     * @default undefined
     */
    applyLabel?: string;
    /**
     * Close action text; uses locale.closeFilters when omitted or undefined (English: Close filters).
     * @default undefined
     */
    closeLabel?: string;
    /**
     * Show the filter panel's clear action when applicable.
     * @default true
     */
    showClear?: boolean;
    /**
     * Show the filter panel's apply action.
     * @default true
     */
    showApply?: boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"filterbar">;
};
type __VLS_Slots = WlFilterBarSlots;
declare function requestOpen(): void;
declare function toggle(): void;
declare function clear(): void;
declare function apply(): void;
type __VLS_ModelProps = {
    /** Whether the mobile filter panel is open.
     * Paired with update:open.
     * @default false
     */
    "open"?: boolean;
    'openModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    activeCount: number;
    showClear: boolean;
    showApply: boolean;
    disabled: boolean;
    density: string;
}>, {
    open: typeof requestOpen;
    close: () => void;
    toggle: typeof toggle;
    clear: typeof clear;
    apply: typeof apply;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    clear: () => void;
    close: () => void;
    apply: () => void;
    open: () => void;
    "update:open": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    activeCount: number;
    showClear: boolean;
    showApply: boolean;
    disabled: boolean;
    density: string;
}>>> & {
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    onClear?: (() => any) | undefined;
    onApply?: (() => any) | undefined;
    "onUpdate:open"?: ((value: boolean) => any) | undefined;
}, {
    disabled: boolean;
    density: WlDensity;
    activeCount: number;
    showClear: boolean;
    showApply: boolean;
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
