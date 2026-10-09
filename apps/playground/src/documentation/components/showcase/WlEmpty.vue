<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlEmpty, WlButton, WlIcon, WlTag } from "../../../../../../packages/ui-kit/src";
const created = ref(false);
const query = ref(t("examples.archive_0430"));
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlEmpty v-if="!created" icon="file" :title="t('examples.no_materials_yet_0052')" :description="t('examples.add_your_first_material_0431')"><template #action><WlButton size="sm" variant="primary" @click="created = true">{{ t("examples.add_first_material_0432") }}</WlButton></template></WlEmpty>
    <div v-else class="wl-inline" data-space="sm"><WlTag variant="green">{{ t("examples.first_material_added_0433") }}</WlTag><WlButton size="sm" variant="ghost" @click="created = false">{{ t("examples.clear_local_list_0434") }}</WlButton></div>
    <WlEmpty v-if="query" icon="search" :title="t('examples.nothing_found_0435')" :description="t('examples.no_results_for_0436') + query + '».'"><template #action><WlButton size="sm" @click="query = ''">{{ t("examples.clear_search_query_0437") }}</WlButton></template></WlEmpty><p v-else class="wl-text-body">{{ t("examples.search_cleared_all_materials_are_available_0438") }}</p>
    <WlEmpty :title="t('examples.choose_a_folder_0439')"><template #icon><WlIcon name="folder" :size="36" /></template><p>{{ t("examples.the_default_slot_lets_you_add_0440") }} <a href="?view=docs">{{ t("examples.a_documentation_link_0441") }}</a> {{ t("examples.and_your_own_instructions_0442") }}</p></WlEmpty>
  </div>
</template>
