import { WlPt } from "../pt-types.js";
import { WlConfirmation } from "../services/confirmation.js";
type __VLS_Props = {
    /** Dialog group; usually optional. */
    group?: string;
    /** Window animation; defaults to WlConfig.motion (true). */
    motion?: boolean;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"confirmdialog">;
};
type __VLS_Slots = {
    /** Custom confirmation message; receives the active confirmation request. */
    default?(props: {
        confirmation: WlConfirmation;
    }): unknown;
    /** Custom confirmation actions with accept and reject callbacks. */
    footer?(props: {
        confirmation: WlConfirmation;
        accept: () => void;
        reject: () => void;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    motion: undefined;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    motion: undefined;
}>>>, {
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
