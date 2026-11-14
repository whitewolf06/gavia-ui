import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSwitchSize } from "../types.js";
declare const __VLS_export: <Value = unknown>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /** Option value (any type). */
        value: NoInfer<Value>;
        /**
         * Size within the component family's documented scale.
         * @default "md"
         */
        size?: WlSwitchSize;
        /**
         * Spacing density for this component family.
         * @default "default"
         */
        density?: WlDensity;
        /** Native group name. */
        name?: string;
        /**
         * Disables the radio button.
         * @default false
         */
        disabled?: boolean;
        /**
         * Error state.
         * @default false
         */
        invalid?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"radio">;
    } & {
        /** Selected value shared by the radio group.
         * Paired with update:modelValue.
         */
        modelValue?: Value;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: Value) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        default?: (props: {}) => any;
    };
    emit: (event: "update:modelValue", value: Value) => void;
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
