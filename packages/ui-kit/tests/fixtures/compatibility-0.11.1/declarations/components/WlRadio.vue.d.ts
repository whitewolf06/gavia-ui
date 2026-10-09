import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
declare const _default: <Value = unknown>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:modelValue"?: ((value: Value) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:modelValue"?: ((value: Value) => any) | undefined;
    }, never>, "onUpdate:modelValue"> & ({
        modelValue?: Value;
        modelModifiers?: Partial<Record<never, true>>;
    } & {
        modelModifiers?: WlNoModelModifiers;
        value: NoInfer<Value>;
        name?: string;
        disabled?: boolean;
        invalid?: boolean;
        pt?: WlPt<"radiobutton">;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: {
        default?(_: {}): any;
    };
    emit: (evt: "update:modelValue", value: Value) => void;
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
