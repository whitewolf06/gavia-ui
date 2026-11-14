import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlOptionDisabled, WlOptionKeyResolver, WlOptionLabel, WlOptionValue, WlOptionValueResolver } from "../selection-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
declare const __VLS_export: <TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * Readonly options from which the user can select.
         * @default []
         */
        options?: readonly TOption[];
        /** Resolve the visible text of an option. */
        optionLabel?: WlOptionLabel<NoInfer<TOption>>;
        /** Resolve the value stored in the selection model. */
        optionValue?: TResolver;
        /** Resolve whether an option is disabled. */
        optionDisabled?: WlOptionDisabled<NoInfer<TOption>>;
        /** Resolve stable option identity; provide keys when options may be reordered. */
        optionKey?: WlOptionKeyResolver<NoInfer<TOption>>;
        /** Visible accessible name for the choice group. */
        legend?: string;
        /** Name used by the component's native form controls. */
        name?: string;
        /**
         * Layout direction and applicable arrow-key navigation direction.
         * @default "vertical"
         */
        orientation?: "horizontal" | "vertical";
        /**
         * Visual treatment within this component family.
         * @default "default"
         */
        variant?: "default";
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
         * Disable user interaction with this component.
         * @default false
         */
        disabled?: boolean;
        /**
         * Expose a validation error state on the control.
         * @default false
         */
        invalid?: boolean;
        /**
         * Indicate pending work supplied by the application.
         * @default false
         */
        loading?: boolean;
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"radiogroup">;
    } & {
        /** Selected option value for the radio group.
         * Paired with update:modelValue.
         */
        modelValue?: WlOptionValue<NoInfer<TOption>, NoInfer<TResolver>>;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: WlOptionValue<NoInfer<TOption>, NoInfer<TResolver>>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        /** Custom accessible group legend. */
        legend?(props: Record<never, never>): unknown;
        /** Custom option content with its value and interaction state. */
        option?(props: {
            option: TOption;
            index: number;
            checked: boolean;
            disabled: boolean;
        }): unknown;
    };
    emit: (event: "update:modelValue", value: WlOptionValue<NoInfer<TOption>, NoInfer<TResolver>>) => void;
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
