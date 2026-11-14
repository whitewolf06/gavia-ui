import { WlPopoverPlacement } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /** Tooltip text when the content slot is not supplied. */
    content?: string;
    /**
     * Preferred overlay side relative to its anchor.
     * @default "top"
     */
    placement?: WlPopoverPlacement;
    /**
     * Delay in milliseconds before showing the tooltip.
     * @default 0
     */
    showDelay?: number;
    /**
     * Delay in milliseconds before hiding the tooltip.
     * @default 100
     */
    hideDelay?: number;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /** Enable motion locally, with application defaults and reduced-motion preferences respected. */
    motion?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"tooltip">;
};
type __VLS_Slots = {
    /** Tooltip trigger content with visibility and explicit show/hide actions. */
    default?(props: {
        visible: boolean;
        show: () => void;
        hide: () => void;
    }): unknown;
    /** Formatted descriptive tooltip content; interactive controls belong in a popover. */
    content?(props: Record<never, never>): unknown;
};
declare function show(): void;
declare function hide(): void;
type __VLS_ModelProps = {
    /** Whether the surface is open.
     * Paired with update:visible.
     * @default false
     */
    "visible"?: boolean;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    placement: string;
    showDelay: number;
    hideDelay: number;
    disabled: boolean;
    motion: undefined;
}>, {
    show: typeof show;
    hide: typeof hide;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:visible": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    placement: string;
    showDelay: number;
    hideDelay: number;
    disabled: boolean;
    motion: undefined;
}>>> & {
    "onUpdate:visible"?: ((value: boolean) => any) | undefined;
}, {
    disabled: boolean;
    motion: boolean;
    placement: WlPopoverPlacement;
    showDelay: number;
    hideDelay: number;
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
