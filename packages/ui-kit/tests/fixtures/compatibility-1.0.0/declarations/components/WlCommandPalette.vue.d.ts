import { WlNoModelModifiers, WlTextModelModifiers } from "../model-types.js";
import { WlCommandPaletteGroup, WlCommandPaletteItem } from "../navigation-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
declare const __VLS_export: <Item extends WlCommandPaletteItem = WlCommandPaletteItem, Group extends WlCommandPaletteGroup<Item> = WlCommandPaletteGroup<Item>>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /**
         * WlCommandPaletteGroup[] with quick links and search results. group.filter selects local or external filtering.
         * @default []
         */
        groups?: readonly (WlCommandPaletteGroup<Item> & Group)[];
        /** Modifier contract for visibility; built-in modifiers are unsupported. */
        visibleModifiers?: WlNoModelModifiers;
        /** Modifiers accepted by the query model; trim normalizes surrounding whitespace. */
        queryModifiers?: WlTextModelModifiers;
        /**
         * Input hint; uses locale.searchPlaceholder when omitted or undefined (English: Search or navigate…).
         * @default undefined
         */
        placeholder?: string;
        /**
         * Empty state; uses locale.noResults when omitted or undefined (English: Nothing found).
         * @default undefined
         */
        emptyText?: string;
        /**
         * Loading text; uses locale.searching when omitted or undefined (English: Searching…).
         * @default undefined
         */
        loadingText?: string;
        /**
         * Accessible name; uses locale.commandPalette when omitted or undefined (English: Command palette).
         * @default undefined
         */
        ariaLabel?: string;
        /**
         * Filter items locally.
         * @default true
         */
        filter?: boolean;
        /**
         * Open with Ctrl/Cmd+K.
         * @default false
         */
        shortcut?: boolean;
        /**
         * Close the surface after an enabled item is selected.
         * @default true
         */
        closeOnSelect?: boolean;
        /**
         * Indicate pending work supplied by the application.
         * @default false
         */
        loading?: boolean;
        /**
         * Disable user interaction with this component.
         * @default false
         */
        disabled?: boolean;
        /**
         * Size within the component family's documented scale.
         * @default "md"
         */
        size?: WlSizeSm;
        /**
         * Spacing density for this component family.
         * @default "default"
         */
        density?: WlDensity;
        /** Window animation; defaults to WlConfig.motion (true). */
        motion?: boolean;
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"commandpalette">;
    } & {
        /** Whether the surface is open.
         * Paired with update:visible.
         * @default false
         */
        visible?: boolean;
        visibleModifiers?: Partial<Record<never, true>>;
        /** Search text; supports the trim model modifier.
         * Paired with update:query.
         * @default ""
         */
        query?: string;
        queryModifiers?: Partial<Record<"trim", true>>;
    }) & {
        onSearch?: ((query: string) => any) | undefined;
        onClose?: (() => any) | undefined;
        onSelect?: ((item: Item, group: Group) => any) | undefined;
        onOpen?: (() => any) | undefined;
        "onUpdate:visible"?: ((value: boolean) => any) | undefined;
        "onUpdate:query"?: ((value: string) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import('vue').ShallowUnwrapRef<{
        focus: () => void | undefined;
        open: () => void;
        close: () => void;
    }>) => void;
    attrs: any;
    slots: {
        /** Group heading; scope { group }. */
        group?(props: {
            group: Group;
        }): unknown;
        /** Complete item markup; scope { item, group, active }. */
        item?(props: {
            item: Item;
            group: Group;
            active: boolean;
        }): unknown;
        /** Item icon; scope { item, group }. */
        "item-icon"?(props: {
            item: Item;
            group: Group;
        }): unknown;
        /** Empty state; scope { query }. */
        empty?(props: {
            query: string;
        }): unknown;
        /** Panel footer. */
        footer?(props: {}): unknown;
    };
    emit: (((evt: "search", query: string) => void) & ((evt: "close") => void) & ((evt: "select", item: Item, group: Group) => void) & ((evt: "open") => void)) & (((event: "update:visible", value: boolean) => void) & ((event: "update:query", value: string) => void));
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
