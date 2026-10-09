<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlTable, WlButton, WlPill, type WlTableColumn } from "../../../../../../packages/ui-kit/src";
interface MaterialRow { title: string; status: string; hours: number }
const state = ref<"ready" | "empty" | "loading">("ready");
const selected = ref("");
const columns: readonly WlTableColumn<MaterialRow>[] = [{ key: "title", label: t("examples.material_0074") }, { key: "status", label: t("examples.status_0067") }, { key: "hours", label: t("examples.hours_0584"), numeric: true }];
const rows: readonly MaterialRow[] = [{ title: t("examples.release_plan_0371"), status: "done", hours: 8 }, { title: t("examples.overview_0000"), status: "progress", hours: 3 }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm" role="group" :aria-label="t('examples.table_state_0585')"><WlButton v-for="item in (['ready', 'empty', 'loading'] as const)" :key="item" size="sm" :aria-pressed="state === item" @click="state = item">{{ { ready: t("examples.data_0127"), empty: t("examples.empty_0586"), loading: t("examples.loading_0587") }[item] }}</WlButton></div>
    <div class="showcase-table-scroll" tabindex="0" role="region" :aria-label="t('examples.materials_table_horizontal_scrolling_0588')">
      <WlTable :value="state === 'empty' ? [] : rows" :columns="columns" :loading="state === 'loading'" :pt="{ table: { 'aria-label': t('examples.team_materials_0083') } }">
        <template #cell-title="{ value }"><WlButton size="sm" variant="link" :disabled="state === 'loading'" @click="selected = String(value)">{{ value }}</WlButton></template>
        <template #cell-status="{ value }"><WlPill :variant="value === 'done' ? 'ok' : 'info'" :label="value === 'done' ? t('examples.done_0047') : t('examples.in_progress_0066')" /></template>
        <template #empty><div class="wl-stack" data-space="sm"><span>{{ t("examples.no_materials_yet_0589") }}</span><div><WlButton size="sm" @click="state = 'ready'">{{ t("examples.restore_list_0590") }}</WlButton></div></div></template>
      </WlTable>
    </div>
    <p class="wl-text-small" role="status">{{ selected ? t("examples.selected_material_0591") + selected : t("examples.click_a_material_title_hours_use_numeric_alignment_0592") }}</p>
    <WlTable><table class="showcase-custom-table"><caption>{{ t("examples.default_slot_custom_table_0593") }}</caption><thead><tr><th scope="col">{{ t("examples.section_0594") }}</th><th scope="col">{{ t("examples.records_0595") }}</th></tr></thead><tbody><tr><th scope="row">{{ t("examples.documents_0596") }}</th><td>2</td></tr></tbody></table></WlTable>
  </div>
</template>
<style scoped>
.showcase-table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); }
.showcase-table-scroll :deep(table) { min-width: 360px; }
.showcase-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.showcase-custom-table { width: 100%; border-collapse: collapse; text-align: left; }
.showcase-custom-table th, .showcase-custom-table td { padding: var(--wl-space-sm); border-bottom: 1px solid var(--wl-border); }
.showcase-custom-table caption { text-align: left; padding-bottom: var(--wl-space-sm); }
</style>
