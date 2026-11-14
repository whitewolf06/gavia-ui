import { WlStepItem } from "../types.js";
type __VLS_Props = {
    /** Ordered step descriptors; the application owns their state.
     * @default []
     */
    items?: readonly WlStepItem[];
    /** Zero-based index of the current step.
     * @default 0
     */
    current?: number;
    /** Enable step buttons and keyboard navigation, skipping disabled items.
     * @default false
     */
    clickable?: boolean;
    /** Layout and arrow-key direction for interactive steps.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
};
type __VLS_Slots = {
    /** Custom step content with its index, current and completed states. */
    step?(props: {
        item: WlStepItem;
        index: number;
        current: boolean;
        completed: boolean;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    items: () => never[];
    current: number;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:current": (index: number) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    items: () => never[];
    current: number;
}>>> & {
    "onUpdate:current"?: ((index: number) => any) | undefined;
}, {
    items: readonly WlStepItem[];
    current: number;
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
