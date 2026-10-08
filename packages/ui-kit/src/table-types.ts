/** Legacy dictionary row; interface rows are supported directly by WlTable<Row>. */
export type WlTableRow = Record<string, unknown>;

/** Only string keys are addressable through the existing columns/cell-* API. */
export type WlTableFieldKey<Row extends object = WlTableRow> = Extract<keyof Row, string>;

export interface WlTableFieldColumn<Row extends object = WlTableRow> {
  key: WlTableFieldKey<Row>;
  label: string;
  kind?: "field";
  numeric?: boolean;
  width?: string | number;
}

/** Virtual keys must be marked explicitly; they cannot disguise misspelled fields. */
export interface WlTableVirtualColumn<Key extends string = string> {
  key: Key;
  label: string;
  kind: "virtual";
  numeric?: boolean;
  width?: string | number;
}

/** Dictionary rows preserve broad string fields; interface rows check actual keys. */
export type WlTableColumn<Row extends object = WlTableRow, VirtualKey extends string = string> =
  WlTableFieldColumn<Row> | WlTableVirtualColumn<VirtualKey>;

export interface WlTableCellSlotProps<Row extends object = WlTableRow, Key extends string = WlTableFieldKey<Row>> {
  row: Row;
  value: Key extends keyof Row ? Row[Key] : unknown;
}

/** Known field slots retain precise values; arbitrary virtual slots require narrowing. */
export type WlTableSlots<Row extends object = WlTableRow> = {
  default?: (props: {}) => unknown;
  empty?: (props: {}) => unknown;
  [name: `cell-${string}`]: ((props: WlTableCellSlotProps<Row, string>) => unknown) | undefined;
} & {
  [Key in WlTableFieldKey<Row> as `cell-${Key}`]?: (props: WlTableCellSlotProps<Row, Key>) => unknown;
};
