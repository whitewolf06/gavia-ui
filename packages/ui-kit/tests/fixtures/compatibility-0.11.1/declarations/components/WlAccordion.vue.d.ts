import { WlAccordionItem, WlAccordionSlots } from '../navigation-types';
import { WlNoModelModifiers } from '../model-types';
declare const _default: <Item extends WlAccordionItem = WlAccordionItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        "onUpdate:openKeys"?: ((value: Item["key"][]) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        "onUpdate:openKeys"?: ((value: Item["key"][]) => any) | undefined;
    }, never>, "onUpdate:openKeys"> & {
        items?: readonly Item[];
        single?: boolean;
        openKeys?: readonly NoInfer<Item["key"]>[];
        openKeysModifiers?: WlNoModelModifiers;
    } & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: Readonly<WlAccordionSlots<Item>> & WlAccordionSlots<Item>;
    emit: (e: "update:openKeys", value: Item["key"][]) => void;
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
