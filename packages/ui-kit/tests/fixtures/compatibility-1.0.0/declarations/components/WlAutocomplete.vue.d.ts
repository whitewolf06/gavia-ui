import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlAutocompleteCompleteEvent, WlAutocompleteModel, WlAutocompleteOptionLabel, WlOptionDisabled, WlOptionKeyResolver } from "../selection-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
declare const __VLS_export: <TOption = unknown, TMultiple extends boolean = false>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * Readonly TOption list; determines the selected suggestion type.
         * @default []
         */
        suggestions?: readonly TOption[];
        /** Label field name or (option) => string function. */
        optionLabel?: WlAutocompleteOptionLabel<NoInfer<TOption>, NoInfer<TMultiple>>;
        /** Option field or predicate identifying disabled options. */
        optionDisabled?: WlOptionDisabled<NoInfer<TOption>>;
        /** Stable option field or key resolver; keeps rendered option state with its data. */
        optionKey?: WlOptionKeyResolver<NoInfer<TOption>>;
        /** Show a named clear button; clears a single model to null. */
        clearable?: boolean;
        /** Placeholder. */
        placeholder?: string;
        /**
         * Error state.
         * @default false
         */
        invalid?: boolean;
        /**
         * Disables the field.
         * @default false
         */
        disabled?: boolean;
        /**
         * Field size.
         * @default "md"
         */
        size?: WlSizeSm;
        /**
         * Density.
         * @default "default"
         */
        density?: WlDensity;
        /** Multiple selection (chips). */
        multiple?: TMultiple & boolean;
        /**
         * List expansion button.
         * @default false
         */
        dropdown?: boolean;
        /**
         * Accessible list expansion button name.
         * Defaults to WlConfig.locale.showOptions (English when unconfigured).
         * @default undefined
         */
        dropdownLabel?: string;
        /**
         * Minimum characters to start a search.
         * @default 1
         */
        minLength?: number;
        /**
         * Delay in milliseconds before requesting completion for changed text.
         * @default 300
         */
        debounce?: number;
        /**
         * Indicate pending work supplied by the application.
         * @default false
         */
        loading?: boolean;
        /** Suggestion animation; defaults to WlConfig.motion (true). */
        motion?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"autocomplete">;
    } & {
        /** Single mode accepts an option, free text or null; multiple mode accepts an option array or null.
         * Paired with update:modelValue.
         */
        modelValue?: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        onComplete?: ((event: WlAutocompleteCompleteEvent) => any) | undefined;
        "onUpdate:modelValue"?: ((value: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        /** Option scope: { option, index, selected, active }. */
        option?(props: {
            option: TOption;
            index: number;
            selected: boolean;
            active: boolean;
        }): unknown;
        /** Selected chip scope: { option, remove }. */
        chip?(props: {
            option: TOption;
            remove: () => void;
        }): unknown;
        /** Content shown when no options match. */
        empty?(props: Record<never, never>): unknown;
        /** Content displayed while consumer-provided work is pending. */
        loading?(props: Record<never, never>): unknown;
    };
    emit: ((evt: "complete", event: WlAutocompleteCompleteEvent) => void) & ((event: "update:modelValue", value: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>) => void);
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
