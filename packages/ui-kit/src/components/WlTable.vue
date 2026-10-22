<script setup lang="ts" generic="Row extends object = WlTableRow">
/** WlTable public component contract.
 * @since 0.1.0
 * @slot default - Custom table content when columns are absent.
 * @slot caption - Custom caption content.
 * @slot header-<key> - Custom header-<key> content.
 * @slot cell-<key> - Scope { row: Row, value: Row[key] }; virtual columns have value: unknown.
 * @slot empty - Custom content for an empty table.
 * @slot loading - Content displayed while application work is pending.
 */
import { computed } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlTableColumn, WlTableRow, WlTableRowClass, WlTableRowKey, WlTableSelectionMode, WlTableSlots, WlTableSort, WlTableSortFn } from "../table-types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { isWlDevelopment } from "../utils/development";
import { useWlId } from "../utils/useWlId";

const props = withDefaults(defineProps<{
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
}>(), {
  value: () => [], columns: undefined, stickyHeader: false, loading: false
});

/** Selected sort key/direction, or null for unsorted rows.
 * Paired with update:sort.
 * @default null
 */
const sort = defineModel<WlTableSort | null, never>("sort", { default: null });
/** Selected stable row keys.
 * Paired with update:selection.
 * @default []
 */
const selection = defineModel<PropertyKey[], never>("selection", { default: () => [] });
const slots = defineSlots<WlTableSlots<Row>>();
const locale = useWlLocale();
const section = useWlPt("table", computed(() => props.pt));
const selectionName = `wl-table-selection-${useWlId()}`;
let warnedMissingKey = false;
let warnedInvalidKey = false;

const rows = computed(() => props.sortFn && sort.value ? props.sortFn(props.value, sort.value) : props.value);
const entries = computed(() => {
  if (isWlDevelopment() && props.selectionMode && props.rowKey === undefined && !warnedMissingKey) {
    warnedMissingKey = true;
    console.warn("WlTable: provide rowKey to preserve row selection when rows are reordered or removed.");
  }
  return rows.value.map((row, index) => ({ row, index, key: keyOf(row, index) }));
});
const selectedKeys = computed(() => new Set(selection.value));
const currentKeys = computed(() => [...new Set(entries.value.map((entry) => entry.key))]);
const selectedCount = computed(() => currentKeys.value.filter((key) => selectedKeys.value.has(key)).length);
const allSelected = computed(() => currentKeys.value.length > 0 && selectedCount.value === currentKeys.value.length);
const partlySelected = computed(() => selectedCount.value > 0 && !allSelected.value);

function keyOf(row: Row, index: number): PropertyKey {
  const key = typeof props.rowKey === "function"
    ? props.rowKey(row, index)
    : props.rowKey === undefined ? index : row[props.rowKey];
  if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") return key;
  if (isWlDevelopment() && !warnedInvalidKey) {
    warnedInvalidKey = true;
    console.warn("WlTable: rowKey must resolve to a string, number or symbol; using the row index for invalid keys.");
  }
  return index;
}
function widthOf(col: WlTableColumn): string | undefined {
  return col.width === undefined ? undefined : typeof col.width === "number" ? `${col.width}px` : col.width;
}
function valueOf(row: Row, key: string): unknown {
  return (row as WlTableRow)[key];
}
function classOf(row: Row, index: number) {
  return typeof props.rowClass === "function" ? props.rowClass(row, index) : props.rowClass;
}
function directionOf(column: WlTableColumn) {
  return sort.value?.key === column.key ? sort.value.direction : null;
}
function sortLabel(column: WlTableColumn): string {
  const direction = directionOf(column);
  const label = direction === "asc"
    ? locale.value.sortDescending
    : direction === "desc" ? locale.value.clearSort : locale.value.sortAscending;
  return formatWlLocaleText(label, { column: column.label });
}
function toggleSort(column: WlTableColumn): void {
  if (!column.sortable || props.loading) return;
  const current = directionOf(column);
  sort.value = current === "desc" ? null : { key: column.key, direction: current === "asc" ? "desc" : "asc" };
}
function selectRow(key: PropertyKey): void {
  if (!props.selectionMode || props.loading) return;
  if (props.selectionMode === "single") selection.value = [key];
  else selection.value = selectedKeys.value.has(key)
    ? selection.value.filter((value) => value !== key && !Object.is(value, key))
    : [...selection.value, key];
}
function selectAll(): void {
  if (props.loading || props.selectionMode !== "multiple") return;
  selection.value = allSelected.value
    ? selection.value.filter((key) => !currentKeys.value.includes(key))
    : [...new Set([...selection.value, ...currentKeys.value])];
}
</script>

<template>
  <div
    v-bind="section('root')"
    class="wl-table"
    data-wl="table"
    :aria-busy="loading || undefined"
  >
    <slot v-if="!columns || columns.length === 0"></slot>
    <table
      v-else
      v-bind="mergeWlAttrs(section('table'), ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})"
      class="wl-table__table"
      :aria-busy="loading || undefined"
    >
      <caption v-if="caption !== undefined || slots.caption" v-bind="section('caption')" class="wl-table__caption">
        <slot name="caption">{{ caption }}</slot>
      </caption>
      <thead v-bind="section('thead')" class="wl-table__head" :class="stickyHeader && 'wl-table__head--sticky'">
        <tr>
          <th
            v-if="selectionMode"
            v-bind="section('selectionHeader')"
            class="wl-table__th wl-table__selection"
            scope="col"
          >
            <input
              v-if="selectionMode === 'multiple'"
              v-bind="section('selectionInput')"
              type="checkbox"
              :aria-label="locale.selectAllRows"
              :checked="allSelected"
              :indeterminate="partlySelected"
              :aria-checked="partlySelected ? 'mixed' : allSelected"
              :disabled="loading || entries.length === 0"
              @change="selectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            v-bind="section('headerCell')"
            class="wl-table__th"
            :class="{ 'wl-table__cell--num': col.numeric }"
            :style="{ width: widthOf(col), textAlign: col.align }"
            :aria-sort="directionOf(col) === 'asc' ? 'ascending' : directionOf(col) === 'desc' ? 'descending' : undefined"
            scope="col"
          >
            <button
              v-if="col.sortable"
              v-bind="section('sortButton')"
              class="wl-table__sort"
              type="button"
              :aria-label="sortLabel(col)"
              :disabled="loading"
              @click="toggleSort(col)"
            >
              <slot
                :name="`header-${col.key}`"
                :column="col"
                :sort="sort"
                :direction="directionOf(col)"
              >{{ col.label }}</slot>
              <span aria-hidden="true">{{ directionOf(col) === 'asc' ? '↑' : directionOf(col) === 'desc' ? '↓' : '↕' }}</span>
            </button>
            <slot
              v-else
              :name="`header-${col.key}`"
              :column="col"
              :sort="sort"
              :direction="directionOf(col)"
            >{{ col.label }}</slot>
          </th>
        </tr>
      </thead>
      <tbody v-bind="section('tbody')" class="wl-table__body">
        <tr
          v-for="entry in entries"
          :key="entry.key"
          v-bind="section('bodyRow')"
          class="wl-table__row"
          :class="classOf(entry.row, entry.index)"
          :data-selected="selectionMode ? selectedKeys.has(entry.key) : undefined"
          :aria-selected="selectionMode ? selectedKeys.has(entry.key) : undefined"
        >
          <td v-if="selectionMode" v-bind="section('selectionCell')" class="wl-table__td wl-table__selection">
            <input
              v-bind="section('selectionInput')"
              :type="selectionMode === 'multiple' ? 'checkbox' : 'radio'"
              :name="selectionMode === 'single' ? selectionName : undefined"
              :checked="selectedKeys.has(entry.key)"
              :disabled="loading"
              :aria-label="formatWlLocaleText(locale.selectRow, { row: entry.index + 1 })"
              @change="selectRow(entry.key)"
            />
          </td>
          <td
            v-for="col in columns"
            :key="col.key"
            class="wl-table__td"
            :class="{ 'wl-table__cell--num': col.numeric }"
            :style="{ textAlign: col.align }"
          >
            <slot
              :name="`cell-${col.key}`"
              :row="entry.row"
              :value="valueOf(entry.row, col.key)"
              :row-index="entry.index"
              :row-key="entry.key"
              :selected="selectedKeys.has(entry.key)"
            >{{ valueOf(entry.row, col.key) }}</slot>
          </td>
        </tr>
        <tr v-if="entries.length === 0 && !loading" v-bind="section('emptyMessage')">
          <td v-bind="section('emptyMessageCell')" class="wl-table__empty-cell" :colspan="columns.length + (selectionMode ? 1 : 0)">
            <slot name="empty">{{ emptyMessage ?? locale.noData }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" v-bind="section('mask')" class="wl-table__mask">
      <slot name="loading"><span
        v-bind="section('loadingIcon')"
        class="wl-table__loading"
        role="status"
        :aria-label="locale.loading"
      ></span></slot>
    </div>
  </div>
</template>
