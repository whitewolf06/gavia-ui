import { WlPopoverAlign, WlPopoverPlacement, WlPopoverTrigger, WlPopoverTriggerSlotProps } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /** Close by clicking outside the popover.
     * @default true
     */
    dismissible?: boolean;
    /**
     * Preferred overlay side relative to its anchor.
     * @default "auto"
     */
    placement?: WlPopoverPlacement;
    /**
     * Alignment of the overlay along its anchor.
     * @default "start"
     */
    align?: WlPopoverAlign;
    /**
     * Show an arrow pointing to the overlay anchor.
     * @default false
     */
    arrow?: boolean;
    /**
     * Interaction that opens the popover; manual mode uses its exposed methods.
     * @default "manual"
     */
    trigger?: WlPopoverTrigger;
    /**
     * Close with Escape.
     * @default true
     */
    closeOnEscape?: boolean;
    /** Accessible popover name. */
    ariaLabel?: string;
    /** ID of the element labelling the popover. */
    ariaLabelledby?: string;
    /** Opening and closing animation; defaults to WlConfig.motion (true). */
    motion?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"popover">;
};
type __VLS_Slots = {
    /** Popover content. */
    default?(props: {}): unknown;
    /** Custom trigger; bind its supplied attributes and use the provided open/close actions. */
    trigger?(props: WlPopoverTriggerSlotProps): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    dismissible: boolean;
    closeOnEscape: boolean;
    motion: undefined;
    placement: string;
    align: string;
    arrow: boolean;
    trigger: string;
}>, {
    toggle: (event?: Event) => void;
    show: (event?: Event) => void;
    hide: (event?: Event) => void;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    close: () => void;
    open: () => void;
    afterLeave: () => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    dismissible: boolean;
    closeOnEscape: boolean;
    motion: undefined;
    placement: string;
    align: string;
    arrow: boolean;
    trigger: string;
}>>> & {
    onAfterLeave?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
}, {
    trigger: WlPopoverTrigger;
    arrow: boolean;
    motion: boolean;
    placement: WlPopoverPlacement;
    align: WlPopoverAlign;
    dismissible: boolean;
    closeOnEscape: boolean;
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
