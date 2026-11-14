import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSwitchSize } from "../types.js";
declare const __VLS_export: <Value = undefined>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /** Value associated with this choice in the group model. */
        value?: Value;
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
        /**
         * Disables the checkbox.
         * @default false
         */
        disabled?: boolean;
        /**
         * Indeterminate state.
         * @default false
         */
        indeterminate?: boolean;
        /**
         * Error state.
         * @default false
         */
        invalid?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"checkbox">;
    } & {
        /** Boolean checked state, or selected values when the checkbox has an array-mode value.
         * Paired with update:modelValue.
         */
        modelValue?: NoInfer<Value extends undefined ? boolean : Value[]>;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: NoInfer<Value extends undefined ? boolean : Value[]>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        default?: (props: {}) => any;
    };
    emit: (event: "update:modelValue", value: NoInfer<Value extends undefined ? boolean : Value[]>) => void;
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
