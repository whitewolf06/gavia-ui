import { WlNoModelModifiers } from '../model-types';
import { WlPt } from '../pt-types';
import { WlTabItem } from '../types';
declare const _default: <Item extends WlTabItem = WlTabItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:modelValue"?: ((value: "" | NoInfer<Item["key"]>) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:modelValue"?: ((value: "" | NoInfer<Item["key"]>) => any) | undefined;
    }, never>, "onUpdate:modelValue"> & ({
        modelValue?: NoInfer<Item["key"]> | "";
        modelModifiers?: Partial<Record<never, true>>;
    } & {
        modelModifiers?: WlNoModelModifiers;
        items?: readonly Item[];
        pt?: WlPt<"tablist">;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: Readonly<{
        panel?(props: {
            item: Item;
        }): unknown;
    }> & {
        panel?(props: {
            item: Item;
        }): unknown;
    };
    emit: (evt: "update:modelValue", value: "" | NoInfer<Item["key"]>) => void;
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
