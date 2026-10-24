/** Legacy dictionary row; interface rows are supported directly by WlTable<Row>. */
export type WlTableRow = Record<string, unknown>;

/** Only string keys are addressable through the existing columns/cell-* API. */
export type WlTableFieldKey<Row extends object = WlTableRow> = Extract<keyof Row, string>;

export type WlTableRowKey<Row extends object = WlTableRow> = keyof Row | ((row: Row, index: number) => PropertyKey);
export type WlTableSortDirection = "asc" | "desc";
export interface WlTableSort {
  key: string;
  direction: WlTableSortDirection;
}
/** Sorting data is opt-in; the default controlled model also supports server sorting. */
export type WlTableSortFn<Row extends object = WlTableRow> = (rows: readonly Row[], sort: WlTableSort) => readonly Row[];
export type WlTableClass = string | Record<string, boolean> | readonly WlTableClass[] | false | null | undefined;
export type WlTableRowClass<Row extends object = WlTableRow> = WlTableClass | ((row: Row, index: number) => WlTableClass);
export type WlTableSelectionMode = "single" | "multiple";

export interface WlTableFieldColumn<Row extends object = WlTableRow> {
  key: WlTableFieldKey<Row>;
  label: string;
  kind?: "field";
  numeric?: boolean;
  width?: string | number;
  align?: "start" | "center" | "end";
  sortable?: boolean;
}

/** Virtual keys must be marked explicitly; they cannot disguise misspelled fields. */
export interface WlTableVirtualColumn<Key extends string = string> {
  key: Key;
  label: string;
  kind: "virtual";
  numeric?: boolean;
  width?: string | number;
  align?: "start" | "center" | "end";
  sortable?: boolean;
}

/** Dictionary rows preserve broad string fields; interface rows check actual keys. */
export type WlTableColumn<Row extends object = WlTableRow, VirtualKey extends string = string>
  = WlTableFieldColumn<Row> | WlTableVirtualColumn<VirtualKey>;

export interface WlTableCellSlotProps<Row extends object = WlTableRow, Key extends string = WlTableFieldKey<Row>> {
  row: Row;
  value: Key extends keyof Row ? Row[Key] : unknown;
  /** Additional render context; optional to retain existing scope-object assignments. */
  rowIndex?: number;
  rowKey?: PropertyKey;
  selected?: boolean;
}

export interface WlTableHeaderSlotProps<Row extends object = WlTableRow, Key extends string = string> {
  column: WlTableColumn<Row> & { key: Key };
  sort: WlTableSort | null;
  direction: WlTableSortDirection | null;
}

/** Known field slots retain precise values; arbitrary virtual slots require narrowing. */
export type WlTableSlots<Row extends object = WlTableRow> = {
  /** Additional content rendered by the table's default outlet. */
  default?: (props: {}) => unknown;
  /** Replacement content for a table with no rows. */
  empty?: (props: {}) => unknown;
  /** Replacement content while loading is active. */
  loading?: (props: {}) => unknown;
  /** Custom accessible table caption. */
  caption?: (props: {}) => unknown;
  /** Virtual cell content; narrow unknown values for non-field column keys. */
  [name: `cell-${string}`]: ((props: WlTableCellSlotProps<Row, string>) => unknown) | undefined;
  /** Custom column heading with the column and current sort state. */
  [name: `header-${string}`]: ((props: WlTableHeaderSlotProps<Row>) => unknown) | undefined;
} & {
  /** Cells for known row fields preserve the corresponding field value type. */
  [Key in WlTableFieldKey<Row> as `cell-${Key}`]?: (props: WlTableCellSlotProps<Row, Key>) => unknown;
} & {
  /** Column headings for known row fields preserve their key domain. */
  [Key in WlTableFieldKey<Row> as `header-${Key}`]?: (props: WlTableHeaderSlotProps<Row, Key>) => unknown;
};
