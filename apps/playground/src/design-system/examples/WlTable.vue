<script setup lang="ts">
import { computed, ref } from "vue";
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlPill, WlTable, type WlTableSort, type WlTableSortFn } from "gavia-ui";
interface MaterialRow { id: number; name: string; status: string }
const rows = computed<MaterialRow[]>(() => [
  { id: 1, name: t("examples.team_guide_0016"), status: t("examples.done_0047") },
  { id: 2, name: t("examples.research_plan_0132"), status: t("examples.in_progress_0066") }
]);
const sort = ref<WlTableSort | null>(null);
const selection = ref<PropertyKey[]>([]);
const sortRows: WlTableSortFn<MaterialRow> = (value, order) => [...value].sort((left, right) => {
  const result = (order.key === "name" ? left.name : left.status).localeCompare(order.key === "name" ? right.name : right.status);
  return order.direction === "asc" ? result : -result;
});
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTable
      v-model:sort="sort"
      v-model:selection="selection"
      :columns="[
        { key: 'name', label: t('examples.material_0074'), sortable: true },
        { key: 'status', label: t('examples.status_0067'), sortable: true }
      ]"
      :value="rows"
      row-key="id"
      selection-mode="multiple"
      :caption="t('examples.team_materials_0083')"
      :sort-fn="sortRows"
      :pt="{ root: { style: { overflowX: 'auto' } } }"
      v-bind="preview"
    ><template #cell-status="{ value }"><WlPill variant="info" :label="String(value)" /></template></WlTable>
  </div>
</template>
