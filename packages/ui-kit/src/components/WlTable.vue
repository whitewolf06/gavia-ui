<script setup lang="ts" generic="Row extends object = WlTableRow">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt, useWlLocale, useWlLocaleText } from "../config";
import type { WlTableColumn, WlTableRow, WlTableSlots } from "../table-types";
const localeText = useWlLocaleText();
const locale = useWlLocale();

const props = withDefaults(
  defineProps<{
    value?: readonly Row[];
    columns?: readonly WlTableColumn<NoInfer<Row>>[];
    loading?: boolean;
    emptyMessage?: string;
    pt?: WlPt<"datatable">;
  }>(),
  {
    value: () => [],
    columns: undefined,
    loading: false,
    emptyMessage: "Нет данных"
  }
);
defineSlots<WlTableSlots<Row>>();
const section = useWlPt("datatable", computed(() => props.pt));

function widthOf(col: WlTableColumn): string | undefined {
  return col.width === undefined ? undefined : typeof col.width === "number" ? `${col.width}px` : col.width;
}
function valueOf(row: Row, key: string): unknown {
  // A lookup keeps the existing virtual-column behavior (missing keys are undefined).
  return (row as WlTableRow)[key];
}
</script>

<template>
  <div v-bind="section('root')" class="wl-table" data-wl="table" :aria-busy="loading || undefined">
    <slot v-if="!columns || columns.length === 0" />
    <table v-else v-bind="section('table')" class="wl-table__table">
      <thead v-bind="section('thead')" class="wl-table__head">
        <tr><th v-for="col in columns" :key="col.key" class="wl-table__th"
          :class="{ 'wl-table__cell--num': col.numeric }" :style="{ width: widthOf(col) }" scope="col">{{ col.label }}</th></tr>
      </thead>
      <tbody v-bind="section('tbody')" class="wl-table__body">
        <tr v-for="(row, rowIndex) in value" :key="rowIndex" v-bind="section('bodyRow')" class="wl-table__row">
          <td v-for="col in columns" :key="col.key" class="wl-table__td"
            :class="{ 'wl-table__cell--num': col.numeric }">
            <slot :name="`cell-${col.key}`" :row="row" :value="valueOf(row, col.key)">{{ valueOf(row, col.key) }}</slot>
          </td>
        </tr>
        <tr v-if="value.length === 0" v-bind="section('emptyMessage')"><td v-bind="section('emptyMessageCell')"
          class="wl-table__empty-cell" :colspan="columns.length"><slot name="empty">{{ localeText('emptyMessage', emptyMessage, 'noData') }}</slot></td></tr>
      </tbody>
    </table>
    <div v-if="loading" v-bind="section('mask')" class="wl-table__mask">
      <span v-bind="section('loadingIcon')" class="wl-table__loading" role="status" :aria-label="locale.loading" />
    </div>
  </div>
</template>
