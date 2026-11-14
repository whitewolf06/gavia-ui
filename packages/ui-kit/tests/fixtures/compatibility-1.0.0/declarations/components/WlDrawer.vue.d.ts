import { WlNoModelModifiers } from "../model-types.js";
import { WlOverlayInitialFocus, WlOverlaySize } from "../overlay-types.js";
import { WlPt } from "../pt-types.js";
import { WlDrawerPosition } from "../types.js";
type __VLS_Props = {
    /** Heading (when no header slot is provided). */
    header?: string;
    /** Modifier contract for visibility; built-in modifiers are unsupported. */
    visibleModifiers?: WlNoModelModifiers;
    /**
     * Opening side.
     * @default "right"
     */
    position?: WlDrawerPosition;
    /**
     * Modal mode with backdrop.
     * @default true
     */
    modal?: boolean;
    /** Close by clicking the backdrop.
     * @default true
     */
    dismissible?: boolean;
    /**
     * Show the explicit close action.
     * @default true
     */
    closable?: boolean;
    /** Size within the component family's documented scale. */
    size?: WlOverlaySize;
    /** Explicit surface width as a CSS length or a pixel number. */
    width?: string | number;
    /** Initial focus policy or target for the opened modal surface. */
    initialFocus?: WlOverlayInitialFocus;
    /**
     * Close with Escape.
     * @default true
     */
    closeOnEscape?: boolean;
    /**
     * Locks page scrolling while the panel is open.
     * @default true
     */
    blockScroll?: boolean;
    /** Accessible panel name without a text heading. */
    ariaLabel?: string;
    /** ID of the element labelling the panel. */
    ariaLabelledby?: string;
    /** Opening and closing animation; defaults to WlConfig.motion (true). */
    motion?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"drawer">;
};
type __VLS_Slots = {
    /** Panel content. */
    default?(props: {}): unknown;
    /** Custom header. */
    header?(props: {}): unknown;
    /** Footer. */
    footer?(props: {}): unknown;
};
type __VLS_ModelProps = {
    /** Whether the surface is open.
     * Paired with update:visible.
     * @default false
     */
    "visible"?: boolean;
    'visibleModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    position: string;
    modal: boolean;
    dismissible: boolean;
    closable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
    motion: undefined;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    close: () => void;
    open: () => void;
    afterLeave: () => void;
    "update:visible": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    position: string;
    modal: boolean;
    dismissible: boolean;
    closable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
    motion: undefined;
}>>> & {
    onAfterLeave?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    "onUpdate:visible"?: ((value: boolean) => any) | undefined;
}, {
    modal: boolean;
    position: WlDrawerPosition;
    motion: boolean;
    closable: boolean;
    dismissible: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
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
