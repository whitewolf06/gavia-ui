import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlOptionDisabled, WlOptionGroupChildrenResolver, WlOptionKeyResolver, WlOptionLabel, WlOptionLeaf, WlOptionValueResolver, WlSelectionExpose, WlSelectModel } from "../selection-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
declare const __VLS_export: <TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>> | undefined = undefined, TGroupChildren extends WlOptionGroupChildrenResolver<NoInfer<TOption>> | undefined = undefined>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * Readonly TOption list; the model type is determined by optionValue.
         * @default []
         */
        options?: readonly TOption[];
        /** Label field name or (option) => string function. */
        optionLabel?: WlOptionLabel<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>>;
        /** TOption key or (option: TOption) => TValue function; determines model type. */
        optionValue?: TResolver;
        /** Option field or predicate identifying disabled options. */
        optionDisabled?: WlOptionDisabled<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>>;
        /** Stable option field or key resolver; keeps rendered option state with its data. */
        optionKey?: WlOptionKeyResolver<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>>;
        /** Resolve the visible label of an option group. */
        optionGroupLabel?: WlOptionLabel<NoInfer<TOption>>;
        /** Resolve the readonly child options of a group descriptor. */
        optionGroupChildren?: TGroupChildren;
        /**
         * Enable local filtering of available options.
         * @default false
         */
        filter?: boolean;
        /**
         * Indicate pending work supplied by the application.
         * @default false
         */
        loading?: boolean;
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
        /** List animation; defaults to WlConfig.motion (true). */
        motion?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"select">;
    } & {
        /** Selected option or resolved value; null clears the selection.
         * Paired with update:modelValue.
         */
        modelValue?: WlSelectModel<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>, NoInfer<TResolver>>;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: WlSelectModel<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>, NoInfer<TResolver>>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<WlSelectionExpose>) => void;
    attrs: any;
    slots: {
        /** Option scope: { option, index, selected, active }. */
        option?(props: {
            option: WlOptionLeaf<TOption, TGroupChildren>;
            index: number;
            selected: boolean;
            active: boolean;
        }): unknown;
        /** Custom option-group heading; receives the descriptor and resolved label. */
        optiongroup?(props: {
            group: TOption;
            label: string;
        }): unknown;
        /** Selected value scope: { option, placeholder }. */
        value?(props: {
            option: WlOptionLeaf<TOption, TGroupChildren> | undefined;
            placeholder: string | undefined;
        }): unknown;
        /** Content displayed while consumer-provided work is pending. */
        loading?(props: Record<never, never>): unknown;
        /** Content shown when no options match. */
        empty?(props: Record<never, never>): unknown;
        /** Content before the option list. */
        header?(props: Record<never, never>): unknown;
        /** Content after the option list. */
        footer?(props: Record<never, never>): unknown;
    };
    emit: (event: "update:modelValue", value: WlSelectModel<NoInfer<WlOptionLeaf<TOption, TGroupChildren>>, NoInfer<TResolver>>) => void;
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
