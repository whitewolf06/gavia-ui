import { WlPt } from "../pt-types.js";
import { WlAvatarPresence, WlAvatarSize } from "../types.js";
type __VLS_Props = {
    /** Explicit fallback text, used instead of initials derived from name. */
    label?: string;
    /** Person's name, used for image alt text and fallback initials. */
    name?: string;
    /** Image URL; a failed image falls back to label or initials. */
    image?: string;
    /** Avatar size in pixels.
     * @default 32
     */
    size?: WlAvatarSize;
    /** Optional presence indicator. */
    presence?: WlAvatarPresence;
    /** Accessible presence text; otherwise the current locale supplies it. */
    presenceLabel?: string;
    /** Avatar outline shape.
     * @default "circle"
     */
    shape?: "circle" | "square";
    /** Attributes for the avatar root, image and fallback label sections. */
    pt?: WlPt<"avatar">;
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    size: number;
    shape: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    size: number;
    shape: string;
}>>>, {
    size: WlAvatarSize;
    shape: "circle" | "square";
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
