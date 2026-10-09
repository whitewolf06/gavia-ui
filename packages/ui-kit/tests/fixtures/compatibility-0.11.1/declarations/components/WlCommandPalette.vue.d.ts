import { WlDensity, WlSizeSm } from '../types';
import { WlCommandPaletteGroup, WlCommandPaletteItem } from '../navigation-types';
import { WlNoModelModifiers, WlTextModelModifiers } from '../model-types';
declare const _default: <Item extends WlCommandPaletteItem = WlCommandPaletteItem, Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{
        onSelect?: ((item: Item, group: Group) => any) | undefined;
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
        onSearch?: ((query: string) => any) | undefined;
        "onUpdate:visible"?: ((value: boolean) => any) | undefined;
        "onUpdate:query"?: ((value: string) => any) | undefined;
    } & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>> & {
        onSelect?: ((item: Item, group: Group) => any) | undefined;
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
        onSearch?: ((query: string) => any) | undefined;
        "onUpdate:visible"?: ((value: boolean) => any) | undefined;
        "onUpdate:query"?: ((value: string) => any) | undefined;
    }, never>, "onSelect" | "onClose" | "onOpen" | "onSearch" | "onUpdate:visible" | "onUpdate:query"> & ({
        visible?: boolean;
        visibleModifiers?: Partial<Record<never, true>>;
        query?: string;
        queryModifiers?: Partial<Record<"trim", true>>;
    } & {
        groups?: readonly (WlCommandPaletteGroup<Item> & Group)[];
        visibleModifiers?: WlNoModelModifiers;
        queryModifiers?: WlTextModelModifiers;
        placeholder?: string;
        emptyText?: string;
        loadingText?: string;
        ariaLabel?: string;
        filter?: boolean;
        shortcut?: boolean;
        closeOnSelect?: boolean;
        loading?: boolean;
        disabled?: boolean;
        size?: WlSizeSm;
        density?: WlDensity;
        motion?: boolean;
    }) & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{
        focus: () => void | undefined;
        open: () => void;
        close: () => void;
    }>): void;
    attrs: any;
    slots: Readonly<{
        group?(props: {
            group: Group;
        }): unknown;
        item?(props: {
            item: Item;
            group: Group;
            active: boolean;
        }): unknown;
        "item-icon"?(props: {
            item: Item;
            group: Group;
        }): unknown;
        empty?(props: {
            query: string;
        }): unknown;
        footer?(props: {}): unknown;
    }> & {
        group?(props: {
            group: Group;
        }): unknown;
        item?(props: {
            item: Item;
            group: Group;
            active: boolean;
        }): unknown;
        "item-icon"?(props: {
            item: Item;
            group: Group;
        }): unknown;
        empty?(props: {
            query: string;
        }): unknown;
        footer?(props: {}): unknown;
    };
    emit: (((evt: "select", item: Item, group: Group) => void) & ((evt: "search", query: string) => void) & ((evt: "close") => void) & ((evt: "open") => void)) & (((evt: "update:visible", value: boolean) => void) & ((evt: "update:query", value: string) => void));
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};
