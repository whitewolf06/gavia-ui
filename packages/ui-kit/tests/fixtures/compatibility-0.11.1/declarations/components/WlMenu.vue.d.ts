import { WlPt } from '../pt-types';
import { WlMenuItem, WlMenuItemBase } from '../navigation-types';
declare const _default: <Item extends WlMenuItemBase = WlMenuItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
    }, never>, "onClose" | "onOpen"> & {
        items?: readonly (Item & WlMenuItem<NoInfer<Item>>)[];
        popup?: boolean;
        ariaLabel?: string;
        ariaLabelledby?: string;
        motion?: boolean;
        pt?: WlPt<"menu">;
    } & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{
        toggle: (event?: Event) => void;
        show: (event?: Event) => void;
        hide: (event?: Event) => void;
    }>): void;
    attrs: any;
    slots: {};
    emit: ((evt: "close") => void) & ((evt: "open") => void);
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
