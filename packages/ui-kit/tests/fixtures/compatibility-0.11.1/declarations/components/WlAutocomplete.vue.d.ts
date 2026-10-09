import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
import { WlDensity, WlSizeSm } from '../types';
import { WlAutocompleteCompleteEvent, WlAutocompleteModel, WlAutocompleteOptionLabel } from '../selection-types';
declare const _default: <TOption = unknown, TMultiple extends boolean = false>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:modelValue"?: ((value: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>) => any) | undefined;
        onComplete?: ((event: WlAutocompleteCompleteEvent) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:modelValue"?: ((value: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>) => any) | undefined;
        onComplete?: ((event: WlAutocompleteCompleteEvent) => any) | undefined;
    }, never>, "onUpdate:modelValue" | "onComplete"> & ({
        modelValue?: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>;
        modelModifiers?: Partial<Record<never, true>>;
    } & {
        modelModifiers?: WlNoModelModifiers;
        suggestions?: readonly TOption[];
        optionLabel?: WlAutocompleteOptionLabel<NoInfer<TOption>, NoInfer<TMultiple>>;
        placeholder?: string;
        invalid?: boolean;
        disabled?: boolean;
        size?: WlSizeSm;
        density?: WlDensity;
        multiple?: TMultiple & boolean;
        dropdown?: boolean;
        dropdownLabel?: string;
        minLength?: number;
        motion?: boolean;
        pt?: WlPt<"autocomplete">;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: Readonly<{}>;
    emit: ((evt: "complete", event: WlAutocompleteCompleteEvent) => void) & ((evt: "update:modelValue", value: WlAutocompleteModel<NoInfer<TOption>, NoInfer<TMultiple>>) => void);
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
