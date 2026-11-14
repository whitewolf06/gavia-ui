import { WlPt } from "../pt-types.js";
import { WlToastMessage, WlToastPosition } from "../services/toast.js";
type __VLS_Props = {
    /** Notification group. */
    group?: string;
    /** Message animation; defaults to WlConfig.motion (true). */
    motion?: boolean;
    /**
     * Screen position of the toast group.
     * @default "bottom-center"
     */
    position?: WlToastPosition;
    /**
     * Maximum retained messages in this toast group; older messages are removed.
     * @default 5
     */
    max?: number;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"toast">;
};
type __VLS_Slots = {
    /** Custom toast message content with a dismiss callback. */
    message?(props: {
        message: WlToastMessage;
        dismiss: () => void;
    }): unknown;
    /** Custom toast action; receives the message and a dismiss callback. */
    action?(props: {
        message: WlToastMessage;
        dismiss: () => void;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    motion: undefined;
    position: string;
    max: number;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    motion: undefined;
    position: string;
    max: number;
}>>>, {
    max: number;
    position: WlToastPosition;
    motion: boolean;
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
