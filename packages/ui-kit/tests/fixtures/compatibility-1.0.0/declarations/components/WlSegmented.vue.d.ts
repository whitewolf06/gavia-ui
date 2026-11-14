import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSegmentedOption, WlSizeSm } from "../types.js";
declare const __VLS_export: <Value extends string = string>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * WlSegmentedOption[] options: { label, value, icon?, disabled? }.
         * @default []
         */
        options?: readonly WlSegmentedOption<Value>[];
        /**
         * Disables the entire control.
         * @default false
         */
        disabled?: boolean;
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
        /**
         * Fill the available inline width.
         * @default false
         */
        block?: boolean;
        /**
         * Layout direction and applicable arrow-key navigation direction.
         * @default "horizontal"
         */
        orientation?: "horizontal" | "vertical";
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"segmented">;
    } & {
        /** Selected option value, or null when no option is selected.
         * Paired with update:modelValue.
         * @default null
         */
        modelValue?: NoInfer<Value> | null;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: NoInfer<Value> | null) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {};
    emit: (event: "update:modelValue", value: NoInfer<Value> | null) => void;
}>) => import('vue').VNode & {
    __ctx?: NonNullable<Awaited<typeof __VLS_setup>>;
};
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
