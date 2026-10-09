import { WlDensity } from '../types';
import { WlSidebarGroup, WlSidebarItem } from '../navigation-types';
import { WlNoModelModifiers } from '../model-types';
declare const _default: <Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        onSelect?: ((item: Item, group?: Group | undefined) => any) | undefined;
        "onUpdate:modelValue"?: ((value: NoInfer<Item["key"]>) => any) | undefined;
        "onUpdate:pinned"?: ((value: boolean) => any) | undefined;
        "onUpdate:mobileOpen"?: ((value: boolean) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        onSelect?: ((item: Item, group?: Group | undefined) => any) | undefined;
        "onUpdate:modelValue"?: ((value: NoInfer<Item["key"]>) => any) | undefined;
        "onUpdate:pinned"?: ((value: boolean) => any) | undefined;
        "onUpdate:mobileOpen"?: ((value: boolean) => any) | undefined;
    }, never>, "onSelect" | "onUpdate:modelValue" | "onUpdate:pinned" | "onUpdate:mobileOpen"> & ({
        modelValue?: NoInfer<Item["key"]>;
        modelModifiers?: Partial<Record<never, true>>;
        pinned?: boolean;
        pinnedModifiers?: Partial<Record<never, true>>;
        mobileOpen?: boolean;
        mobileOpenModifiers?: Partial<Record<never, true>>;
    } & {
        groups?: readonly (WlSidebarGroup<Item> & Group)[];
        modelModifiers?: WlNoModelModifiers;
        pinnedModifiers?: WlNoModelModifiers;
        mobileOpenModifiers?: WlNoModelModifiers;
        footerItems?: readonly Item[];
        brand?: string;
        brandMark?: string;
        ariaLabel?: string;
        collapsible?: boolean;
        expandOnHover?: boolean;
        showPin?: boolean;
        pinLabel?: string;
        unpinLabel?: string;
        density?: WlDensity;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{
        openMobile: () => void;
        closeMobile: () => void;
        togglePinned: () => void;
    }>): void;
    attrs: any;
    slots: Readonly<{
        brand?(props: {}): unknown;
        "brand-mark"?(props: {}): unknown;
        item?(props: {
            key: Item["key"];
            item: Item;
            group: Group;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        "footer-item"?(props: {
            key: Item["key"];
            item: Item;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        footer?(props: {
            expanded: boolean;
        }): unknown;
    }> & {
        brand?(props: {}): unknown;
        "brand-mark"?(props: {}): unknown;
        item?(props: {
            key: Item["key"];
            item: Item;
            group: Group;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        "footer-item"?(props: {
            key: Item["key"];
            item: Item;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        footer?(props: {
            expanded: boolean;
        }): unknown;
    };
    emit: ((evt: "select", item: Item, group?: Group | undefined) => void) & (((evt: "update:modelValue", value: NoInfer<Item["key"]>) => void) & ((evt: "update:pinned", value: boolean) => void) & ((evt: "update:mobileOpen", value: boolean) => void));
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
