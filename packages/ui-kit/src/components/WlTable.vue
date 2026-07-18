<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { WlTableColumn, WlTableRow } from "../types";

const props = withDefaults(
  defineProps<{
    value?: WlTableRow[];
    columns?: WlTableColumn[];
    loading?: boolean;
    emptyMessage?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    value: () => [],
    columns: undefined,
    loading: false,
    emptyMessage: "Нет данных"
  }
);

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

function columnPt(col: WlTableColumn): Record<string, unknown> {
  const num = col.numeric ? "wl-table__cell--num" : "";
  const width = col.width === undefined ? undefined : typeof col.width === "number" ? `${col.width}px` : col.width;
  // Note: PrimeVue's getColumnPT empirically drops the per-Column `root` key,
  // so headerCell/bodyCell carry the classes directly.
  const headerCell: Record<string, unknown> = { class: cx("wl-table__th", num) };
  if (width) headerCell.style = { width };
  return { headerCell, bodyCell: { class: cx("wl-table__td", num) } };
}
</script>

<template>
  <DataTable
    :value="value"
    :loading="loading"
    :pt="pt"
    class="wl-table"
    data-wl="table"
  >
    <slot v-if="!columns || columns.length === 0" />
    <template v-else>
      <Column
        v-for="col in columns"
        :key="col.key"
        :field="col.key"
        :header="col.label"
        :pt="columnPt(col)"
      >
        <template #body="{ data }">
          <slot :name="`cell-${col.key}`" :row="data" :value="data[col.key]">{{ data[col.key] }}</slot>
        </template>
      </Column>
    </template>
    <template #empty>
      <slot name="empty">{{ emptyMessage }}</slot>
    </template>
  </DataTable>
</template>
