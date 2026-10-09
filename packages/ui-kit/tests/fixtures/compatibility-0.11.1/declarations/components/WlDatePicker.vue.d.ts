import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
import { WlDatePickerModel, WlDatePickerSelectionMode, WlSizeSm } from '../types';
declare const _default: <Mode extends WlDatePickerSelectionMode = "single">(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:modelValue"?: ((value: WlDatePickerModel<NoInfer<Mode>>) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:modelValue"?: ((value: WlDatePickerModel<NoInfer<Mode>>) => any) | undefined;
    }, never>, "onUpdate:modelValue"> & ({
        modelValue?: WlDatePickerModel<NoInfer<Mode>>;
        modelModifiers?: Partial<Record<never, true>>;
    } & {
        modelModifiers?: WlNoModelModifiers;
        placeholder?: string;
        size?: WlSizeSm;
        disabled?: boolean;
        invalid?: boolean;
        showIcon?: boolean;
        minDate?: string;
        maxDate?: string;
        displayFormat?: "dd.mm.yyyy" | "yyyy-mm-dd";
        selectionMode?: Mode;
        startLabel?: string;
        endLabel?: string;
        motion?: boolean;
        pt?: WlPt<"datepicker">;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: {};
    emit: (evt: "update:modelValue", value: WlDatePickerModel<NoInfer<Mode>>) => void;
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
