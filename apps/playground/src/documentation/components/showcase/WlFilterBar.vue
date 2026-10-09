<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlFilterBar, WlInput, WlSelect, WlTag, WlButton } from "../../../../../../packages/ui-kit/src";
const search = ref("");
const status = ref<string | null>(null);
const open = ref(false);
const applied = ref(0);
const statuses = [{ label: t("examples.done_0047"), value: "done" }, { label: t("examples.in_progress_0066"), value: "progress" }];
const count = computed(() => Number(Boolean(search.value)) + Number(Boolean(status.value)));
function clear(): void { search.value = ""; status.value = null; }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlFilterBar class="showcase-filters" v-model:open="open" :active-count="count" :aria-label="t('examples.material_list_filters_0455')" :toggle-label="t('examples.configure_filters_0456')" :panel-title="t('examples.material_filters_0187')" @clear="clear" @apply="applied++">
      <template #leading><WlInput v-model="search" type="search" :aria-label="t('examples.search_the_material_list_0457')" :placeholder="t('examples.material_title_0056')" /></template>
      <WlSelect v-model="status" :options="statuses" option-label="label" option-value="value" :aria-label="t('examples.material_list_status_0458')" :placeholder="t('examples.all_statuses_0068')" />
      <template #actions="{ clear: clearValues }"><WlButton size="sm" variant="ghost" :disabled="count === 0" @click="clearValues">{{ t("examples.reset_list_filters_0459") }}</WlButton><WlButton size="sm" @click="applied++">{{ t("examples.apply_on_desktop_0460") }}</WlButton></template>
      <template #summary><div class="wl-inline" data-space="sm"><WlTag v-if="search" removable :remove-label="t('examples.remove_search_0461') + search" @remove="search = ''">{{ t("examples.search_0462") }} {{ search }}</WlTag><WlTag v-if="status" variant="blue" removable :remove-label="t('examples.remove_status_filter_0192')" @remove="status = null">{{ statuses.find(item => item.value === status)?.label }}</WlTag><span v-if="!count" class="wl-text-small wl-text-muted">{{ t("examples.no_active_filters_0463") }}</span></div></template>
    </WlFilterBar>
    <p class="wl-text-small" role="status">{{ t("examples.active_filters_0464") }} {{ count }}{{ t("examples.applications_0465") }} {{ applied }}{{ t("examples.settings_open_in_a_drawer_on_narrow_screens_0466") }}</p>
  </div>
</template>
<style scoped>
@media (min-width: 721px) { .showcase-filters :deep(.wl-filter-bar__toolbar) { flex-wrap: wrap; } }
</style>
