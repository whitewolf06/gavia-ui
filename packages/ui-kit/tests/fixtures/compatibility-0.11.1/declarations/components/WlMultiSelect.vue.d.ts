import { WlDensity, WlMultiSelectDisplay, WlSizeSm } from '../types';
import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
import { WlMultiSelectModel, WlOptionLabel, WlOptionValueResolver } from '../selection-types';
declare const _default: <TOption = unknown, TResolver extends WlOptionValueResolver<NoInfer<TOption>> | undefined = undefined>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:modelValue"?: ((value: WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:modelValue"?: ((value: WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>) => any) | undefined;
    }, never>, "onUpdate:modelValue"> & ({
        modelValue?: WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>;
        modelModifiers?: Partial<Record<never, true>>;
    } & {
        modelModifiers?: WlNoModelModifiers;
        options?: readonly TOption[];
        optionLabel?: WlOptionLabel<NoInfer<TOption>>;
        optionValue?: TResolver;
        placeholder?: string;
        invalid?: boolean;
        disabled?: boolean;
        size?: WlSizeSm;
        density?: WlDensity;
        filter?: boolean;
        display?: WlMultiSelectDisplay;
        maxSelectedLabels?: number;
        motion?: boolean;
        pt?: WlPt<"multiselect">;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: Readonly<{}>;
    emit: (evt: "update:modelValue", value: WlMultiSelectModel<NoInfer<TOption>, NoInfer<TResolver>>) => void;
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
