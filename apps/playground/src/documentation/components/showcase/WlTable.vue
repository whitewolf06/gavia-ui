<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, WlPill, WlTable, type WlTableColumn, type WlTableSort, type WlTableSortFn } from "gavia-ui";
import { computed, ref } from "vue";
interface MaterialRow { id: number; title: string; status: string; hours: number }
const state = ref<"ready" | "empty" | "loading">("ready");
const selected = ref("");
const selection = ref<PropertyKey[]>([]);
const sort = ref<WlTableSort | null>(null);
const columns = computed<readonly WlTableColumn<MaterialRow>[]>(() => [
  { key: "title", label: t("examples.material_0074"), sortable: true },
  { key: "status", label: t("examples.status_0067"), align: "center" },
  { key: "hours", label: t("examples.hours_0584"), numeric: true, align: "end", sortable: true }
]);
const rows = computed<readonly MaterialRow[]>(() => [
  { id: 1, title: t("examples.release_plan_0371"), status: "done", hours: 8 },
  { id: 2, title: t("examples.overview_0000"), status: "progress", hours: 3 }
]);
const sortRows: WlTableSortFn<MaterialRow> = (value, order) => [...value].sort((left, right) => {
  const result = order.key === "hours" ? left.hours - right.hours : left.title.localeCompare(right.title);
  return order.direction === "asc" ? result : -result;
});
</script>

<template>
  <div class="wl-stack" data-space="lg" data-table-example="WlTable">
    <div
      class="wl-inline"
      data-space="sm"
      role="group"
      :aria-label="t('examples.table_state_0585')"
    ><WlButton
      v-for="item in (['ready', 'empty', 'loading'] as const)"
      :key="item"
      size="sm"
      :aria-pressed="state === item"
      @click="state = item"
    >{{ { ready: t("examples.data_0127"), empty: t("examples.empty_0586"), loading: t("examples.loading_0587") }[item] }}</WlButton></div>
    <div
      class="showcase-table-scroll"
      tabindex="0"
      role="region"
      :aria-label="t('examples.materials_table_horizontal_scrolling_0588')"
    >
      <WlTable
        v-model:sort="sort"
        v-model:selection="selection"
        :value="state === 'empty' ? [] : rows"
        :columns="columns"
        :loading="state === 'loading'"
        row-key="id"
        selection-mode="multiple"
        sticky-header
        :caption="t('examples.team_materials_0083')"
        :sort-fn="sortRows"
        :row-class="row => ({ 'showcase-table-done': row.status === 'done' })"
      >
        <template #header-hours="{ column }">{{ column.label }}</template>
        <template #cell-title="{ value }"><WlButton
          size="sm"
          variant="link"
          :disabled="state === 'loading'"
          @click="selected = String(value)"
        >{{ value }}</WlButton></template>
        <template #cell-status="{ value }">
          <WlPill
            :tone="value === 'done' ? 'success' : 'info'"
            :label="value === 'done' ? t('examples.done_0047') : t('examples.in_progress_0066')"
          />
        </template>
        <template #empty>
          <div class="wl-stack" data-space="sm">
            <span>{{ t("examples.no_materials_yet_0589") }}</span>
            <div><WlButton size="sm" @click="state = 'ready'">{{ t("examples.restore_list_0590") }}</WlButton></div>
          </div>
        </template>
        <template #loading>
          <div class="wl-stack" data-space="sm">
            <span role="status">{{ t("examples.loading_materials_0567") }}</span>
            <WlButton size="sm" @click="state = 'ready'">{{ t("examples.cancel_0038") }}</WlButton>
          </div>
        </template>
      </WlTable>
    </div>
    <p class="wl-text-small" role="status">
      {{ selected
        ? t("examples.selected_material_0591") + selected
        : t("examples.click_a_material_title_hours_use_numeric_alignment_0592") }}
    </p>
    <p class="wl-text-small">{{ t("examples.selected_0022") }} {{ selection.length }}</p>
    <WlTable>
      <table class="showcase-custom-table">
        <caption>{{ t("examples.default_slot_custom_table_0593") }}</caption>
        <thead>
          <tr>
            <th scope="col">{{ t("examples.section_0594") }}</th>
            <th scope="col">{{ t("examples.records_0595") }}</th>
          </tr>
        </thead>
        <tbody><tr><th scope="row">{{ t("examples.documents_0596") }}</th><td>2</td></tr></tbody>
      </table>
    </WlTable>
  </div>
</template>

<style scoped>
.showcase-table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); }
.showcase-table-scroll :deep(table) { min-width: 360px; }
.showcase-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.showcase-table-scroll :deep(.showcase-table-done) { font-weight: 600; }
.showcase-custom-table { width: 100%; border-collapse: collapse; text-align: left; }
.showcase-custom-table th, .showcase-custom-table td { padding: var(--wl-space-sm); border-bottom: 1px solid var(--wl-border); }
.showcase-custom-table caption { text-align: left; padding-bottom: var(--wl-space-sm); }
</style>
