<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, nextTick, ref, watch } from "vue";
import { WlPageHeader, WlButton, WlFilterBar, WlInput, WlSelect, WlTag, WlTable, WlPill, WlPagination, WlEmpty, WlDrawer, WlField, useWlConfirm, useWlToast, type WlTableColumn } from "../../../../../packages/ui-kit/src";
type Material = { id: number; title: string; status: string };
const materials = ref<Material[]>(Array.from({ length: 12 }, (_, index) => ({
  id: index + 1, title: [t("examples.team_guide_0016"), t("examples.research_plan_0132"), t("examples.review_guidelines_0177"), t("examples.access_and_roles_0178")][index % 4] + (index < 4 ? "" : ` · ${index + 1}`),
  status: index % 2 ? "progress" : "done"
})));
const search = ref("");
const status = ref<string | null>(null);
const order = ref<string | null>("asc");
const page = ref(1);
const confirm = useWlConfirm();
const toast = useWlToast();
const filtered = computed(() => materials.value.filter((item) =>
  item.title.toLocaleLowerCase("ru").includes(search.value.toLocaleLowerCase("ru")) && (!status.value || item.status === status.value))
  .sort((a, b) => a.title.localeCompare(b.title, "ru") * (order.value === "desc" ? -1 : 1)));
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / 4)));
const visibleRows = computed(() => filtered.value.slice((page.value - 1) * 4, page.value * 4));
watch([search, status, order], () => { page.value = 1; });
watch(pageCount, (count) => { page.value = Math.min(page.value, count); });
const columns: readonly WlTableColumn<Material>[] = [{ key: "title", label: t("examples.material_0074") }, { key: "status", label: t("examples.status_0067") }, { key: "actions", label: t("examples.actions_0032"), kind: "virtual" }];
function clear(): void { search.value = ""; status.value = null; }
const editing = ref(false);
const editingId = ref<number | null>(null);
const title = ref("");
const titleError = ref("");
let nextId = 13;
function edit(item?: Material): void {
  editingId.value = item?.id ?? null; title.value = item?.title ?? ""; titleError.value = ""; editing.value = true;
}
async function save(): Promise<void> {
  titleError.value = title.value.trim() ? "" : t("examples.enter_a_title_0179");
  if (titleError.value) { await nextTick(); document.getElementById("recipe-material-title")?.focus(); return; }
  const current = materials.value.find((item) => item.id === editingId.value);
  if (current) current.title = title.value.trim();
  else materials.value.push({ id: nextId++, title: title.value.trim(), status: "progress" });
  editing.value = false; toast.ok(t("examples.material_saved_0143"));
}
function remove(id: number): void {
  const item = materials.value.find((entry) => entry.id === id);
  if (!item) return;
  confirm.confirmDanger({
    header: t("examples.delete_material_0035"), message: `«${item.title}${t("examples.will_be_deleted_0180")}`, acceptLabel: t("examples.delete_0037"), rejectLabel: t("examples.cancel_0038"),
    accept: () => { materials.value = materials.value.filter((entry) => entry.id !== id); toast.ok(t("examples.material_deleted_0181")); }
  });
}
</script>

<template>
  <section class="wl-stack" data-space="lg" :aria-label="t('examples.material_list_0182')">
    <WlPageHeader :title="t('examples.team_materials_0083')" :description="t('examples.documents_agreements_and_research_0183')" :heading-level="2" size="md">
      <template #meta><WlTag>{{ materials.length }} {{ t("examples.materials_0184") }}</WlTag></template>
      <template #actions><WlButton variant="primary" @click="edit()">{{ t("examples.create_material_0185") }}</WlButton></template>
    </WlPageHeader>
    <WlInput v-model="search" type="search" :placeholder="t('examples.find_a_material_0186')" :aria-label="t('examples.find_a_material_0186')" />
    <WlFilterBar :active-count="Number(Boolean(status))" :aria-label="t('examples.material_filters_0187')" :panel-title="t('examples.material_filters_0187')" @clear="clear">
      <WlSelect v-model="status" :options="[{ label: t('examples.done_0047'), value: 'done' }, { label: t('examples.in_progress_0066'), value: 'progress' }]" option-label="label" option-value="value" :aria-label="t('examples.material_status_0188')" :placeholder="t('examples.all_statuses_0068')" />
      <WlSelect v-model="order" :options="[{ label: t('examples.name_a_z_0189'), value: 'asc' }, { label: t('examples.name_z_a_0190'), value: 'desc' }]" option-label="label" option-value="value" :aria-label="t('examples.material_order_0191')" />
      <template #summary><WlTag v-if="status" removable :remove-label="t('examples.remove_status_filter_0192')" @remove="status = null">{{ status === 'done' ? t("examples.done_0047") : t("examples.in_progress_0066") }}</WlTag></template>
    </WlFilterBar>
    <div v-if="filtered.length" class="ds-material-table" role="region" :aria-label="t('examples.team_materials_0083')" tabindex="0"><WlTable :columns="columns" :value="visibleRows" :pt="{ root: { style: { minWidth: '640px' } } }">
      <template #cell-status="{ value }"><WlPill :variant="value === 'done' ? 'ok' : 'info'" :label="value === 'done' ? t('examples.done_0047') : t('examples.in_progress_0066')" /></template>
      <template #cell-actions="{ row }"><div class="wl-inline" data-space="xs"><WlButton size="sm" variant="ghost" :aria-label="`${t('examples.edit_0193')}${row.title}`" @click="edit(materials.find((item) => item.id === row.id))">{{ t("examples.edit_0194") }}</WlButton><WlButton size="sm" variant="danger-quiet" :aria-label="`${t('examples.delete_0195')}${row.title}`" @click="remove(Number(row.id))">{{ t("examples.delete_0037") }}</WlButton></div></template>
    </WlTable></div>
    <WlEmpty v-else icon="search" :title="t('examples.no_materials_found_0196')" :description="t('examples.change_the_query_or_clear_the_filters_0197')"><template #action><WlButton @click="clear">{{ t("examples.clear_search_0198") }}</WlButton></template></WlEmpty>
    <div class="wl-inline" data-space="md"><WlPagination v-if="filtered.length" v-model:page="page" :page-count="pageCount" /><p class="wl-text-small wl-text-muted" role="status">{{ t("examples.found_0199") }} {{ filtered.length }} {{ t("examples.page_0200") }} {{ page }} {{ t("examples.of_0201") }} {{ pageCount }}</p></div>
    <WlDrawer v-model:visible="editing" :header="editingId ? t('examples.edit_material_0202') : t('examples.new_material_0203')">
      <form id="recipe-material-form" class="wl-stack" data-space="lg" @submit.prevent="save">
        <WlField id="recipe-material-title" :label="t('examples.title_0072')" required :error="titleError" v-slot="field"><WlInput :id="field.id" v-model="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="120" /></WlField>
        <p class="wl-text-small wl-text-muted">{{ t("examples.to_apply_changes_click_save_0204") }}</p>
      </form>
      <template #footer><WlButton variant="ghost" @click="editing = false">{{ t("examples.cancel_0038") }}</WlButton><WlButton variant="primary" type="submit" form="recipe-material-form">{{ t("examples.save_0026") }}</WlButton></template>
    </WlDrawer>
  </section>
</template>

<style scoped>
.ds-material-table { overflow: auto; max-width: 100%; }
</style>
