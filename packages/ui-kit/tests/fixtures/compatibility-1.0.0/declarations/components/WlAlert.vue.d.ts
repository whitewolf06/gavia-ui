import { WlPt } from "../pt-types.js";
import { WlTone } from "../types.js";
type __VLS_Props = {
    /**
     * Semantic notification color.
     * @default "info"
     */
    tone?: WlTone;
    /** Title. */
    title?: string;
    /**
     * Button that closes the surface.
     * @default false
     */
    closable?: boolean;
    /**
     * Close button aria-label; uses locale.close when omitted or undefined (English: Close).
     * @default undefined
     */
    closeLabel?: string;
    /** Override live announcements; off renders a static message. */
    live?: "assertive" | "polite" | "off";
    /** Attributes for internal DOM sections. */
    pt?: WlPt<"alert">;
};
declare var __VLS_1: {
    tone: WlTone;
}, __VLS_8: {}, __VLS_10: {};
type __VLS_Slots = {} & {
    icon?: (props: typeof __VLS_1) => any;
} & {
    default?: (props: typeof __VLS_8) => any;
} & {
    action?: (props: typeof __VLS_10) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
    closable: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    close: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    tone: string;
    closable: boolean;
}>>> & {
    onClose?: ((event: MouseEvent) => any) | undefined;
}, {
    tone: WlTone;
    closable: boolean;
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
