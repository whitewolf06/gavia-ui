import { WlNoModelModifiers } from "../model-types.js";
import { WlSidebarGroup, WlSidebarItem } from "../navigation-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity } from "../types.js";
declare const __VLS_export: <Item extends WlSidebarItem = WlSidebarItem, Group extends WlSidebarGroup<Item> = WlSidebarGroup<Item>>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /**
         * WlSidebarGroup[]: sections with WlSidebarItem[] and an optional separator.
         * @default []
         */
        groups?: readonly (WlSidebarGroup<Item> & Group)[];
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /** Modifier contract for pinned state; built-in modifiers are unsupported. */
        pinnedModifiers?: WlNoModelModifiers;
        /** Modifier contract for the mobile-open model; built-in modifiers are unsupported. */
        mobileOpenModifiers?: WlNoModelModifiers;
        /**
         * WlSidebarItem[] for the pinned bottom region.
         * @default []
         */
        footerItems?: readonly Item[];
        /**
         * Product name.
         * @default ""
         */
        brand?: string;
        /**
         * Short text brand mark.
         * @default ""
         */
        brandMark?: string;
        /**
         * Accessible name; uses locale.mainNavigation when omitted or undefined (English: Main navigation).
         * @default undefined
         */
        ariaLabel?: string;
        /**
         * Allow the sidebar to collapse to its compact state.
         * @default true
         */
        collapsible?: boolean;
        /**
         * Temporarily expand an unpinned sidebar on pointer hover.
         * @default true
         */
        expandOnHover?: boolean;
        /**
         * Show the sidebar pin/unpin action.
         * @default true
         */
        showPin?: boolean;
        /**
         * Pin action text; uses locale.pinSidebar when omitted or undefined (English: Pin sidebar).
         * @default undefined
         */
        pinLabel?: string;
        /**
         * Unpin action text; uses locale.unpinSidebar when omitted or undefined (English: Unpin sidebar).
         * @default undefined
         */
        unpinLabel?: string;
        /**
         * Spacing density for this component family.
         * @default "default"
         */
        density?: WlDensity;
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"sidebar">;
    } & {
        /** Key of the active sidebar item.
         * Paired with update:modelValue.
         */
        modelValue?: NoInfer<Item["key"]>;
        modelModifiers?: Partial<Record<never, true>>;
        /** Whether the sidebar remains expanded.
         * Paired with update:pinned.
         * @default false
         */
        pinned?: boolean;
        pinnedModifiers?: Partial<Record<never, true>>;
        /** Whether the mobile sidebar is open.
         * Paired with update:mobileOpen.
         * @default false
         */
        mobileOpen?: boolean;
        mobileOpenModifiers?: Partial<Record<never, true>>;
    }) & {
        onSelect?: ((item: Item, group?: Group | undefined) => any) | undefined;
        "onUpdate:modelValue"?: ((value: NoInfer<Item["key"]>) => any) | undefined;
        "onUpdate:pinned"?: ((value: boolean) => any) | undefined;
        "onUpdate:mobileOpen"?: ((value: boolean) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<{
        openMobile: () => void;
        closeMobile: () => void;
        togglePinned: () => void;
    }>) => void;
    attrs: any;
    slots: {
        /** Custom brand name. */
        brand?(props: {}): unknown;
        /** Custom brand mark. */
        "brand-mark"?(props: {}): unknown;
        /** Main group item; scope { item, group, active, expanded, select }. */
        item?(props: {
            key: Item["key"];
            item: Item;
            group: Group;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        /** Footer item; scope { item, active, expanded, select }. */
        "footer-item"?(props: {
            key: Item["key"];
            item: Item;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): unknown;
        /** Additional footer; scope { expanded }. */
        footer?(props: {
            expanded: boolean;
        }): unknown;
    };
    emit: ((evt: "select", item: Item, group?: Group | undefined) => void) & (((event: "update:modelValue", value: NoInfer<Item["key"]>) => void) & ((event: "update:pinned", value: boolean) => void) & ((event: "update:mobileOpen", value: boolean) => void));
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
