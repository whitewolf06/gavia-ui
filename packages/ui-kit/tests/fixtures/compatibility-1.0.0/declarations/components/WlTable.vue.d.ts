import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlTableColumn, WlTableRow, WlTableRowClass, WlTableRowKey, WlTableSelectionMode, WlTableSlots, WlTableSort, WlTableSortFn } from "../table-types.js";
declare const __VLS_export: <Row extends object = WlTableRow>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /**
         * Readonly Row extends object list; interfaces without an index signature are supported.
         * @default []
         */
        value?: readonly Row[];
        /**
         * readonly WlTableColumn<Row>[] validates row field keys. For a virtual column (actions), explicitly set kind:
         * "virtual". Without columns, the default slot is used.
         */
        columns?: readonly WlTableColumn<NoInfer<Row>>[];
        /** Field or callback resolving stable row identity across sorting and reordering. */
        rowKey?: WlTableRowKey<NoInfer<Row>>;
        /** Additional CSS classes, or a resolver returning classes for each row. */
        rowClass?: WlTableRowClass<NoInfer<Row>>;
        /** Visible table caption associated with the table. */
        caption?: string;
        /** Accessible name when an external label is not referenced. */
        ariaLabel?: string;
        /**
         * Keep table column headers visible within a scrolling container.
         * @default false
         */
        stickyHeader?: boolean;
        /** Modifier contract for sort state; built-in modifiers are unsupported. */
        sortModifiers?: WlNoModelModifiers;
        /** Modifier contract for selected keys; built-in modifiers are unsupported. */
        selectionModifiers?: WlNoModelModifiers;
        /** Application sorting callback receiving readonly rows and returning their desired order. */
        sortFn?: WlTableSortFn<NoInfer<Row>>;
        /** Enable single or multiple row selection; the selection model stores row keys. */
        selectionMode?: WlTableSelectionMode;
        /**
         * Loading state.
         * @default false
         */
        loading?: boolean;
        /**
         * Empty-state text.
         * Defaults to WlConfig.locale.noData (English when unconfigured).
         * @default undefined
         */
        emptyMessage?: string;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"table">;
    } & {
        /** Selected sort key/direction, or null for unsorted rows.
         * Paired with update:sort.
         * @default null
         */
        sort?: WlTableSort | null;
        sortModifiers?: Partial<Record<never, true>>;
        /** Selected stable row keys.
         * Paired with update:selection.
         * @default []
         */
        selection?: PropertyKey[];
        selectionModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:sort"?: ((value: WlTableSort | null) => any) | undefined;
        "onUpdate:selection"?: ((value: PropertyKey[]) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: WlTableSlots<Row>;
    emit: ((event: "update:sort", value: WlTableSort | null) => void) & ((event: "update:selection", value: PropertyKey[]) => void);
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
