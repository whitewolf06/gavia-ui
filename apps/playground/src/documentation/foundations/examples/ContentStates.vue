<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlAlert, WlButton, WlEmpty, WlSegmented, WlSkeleton } from "../../../../../../packages/ui-kit/src";
const state = ref<string | null>("ready");
const options = [
  { label: t("examples.done_0047"), value: "ready" }, { label: t("examples.loading_0587"), value: "loading" },
  { label: t("examples.empty_0586"), value: "empty" }, { label: t("examples.error_0147"), value: "error" }
];
const materials = [t("examples.launch_plan_0906"), t("examples.access_rules_0907"), t("examples.validation_results_0908")];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <WlSegmented v-model="state" :options="options" :aria-label="t('examples.content_example_state_0909')" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" />
    <div v-if="state === 'loading'" class="wl-stack" data-space="md" role="status" aria-busy="true">
      <p class="wl-text-body">{{ t("examples.loading_materials_0567") }}</p><WlSkeleton height="20px" /><WlSkeleton height="20px" width="80%" /><WlSkeleton height="20px" width="60%" />
    </div>
    <WlEmpty v-else-if="state === 'empty'" icon="file" :title="t('examples.no_materials_yet_0052')" :description="t('examples.add_your_first_material_0431')">
      <template #action><WlButton @click="state = 'ready'">{{ t("examples.add_example_0910") }}</WlButton></template>
    </WlEmpty>
    <WlAlert v-else-if="state === 'error'" variant="err" :title="t('examples.could_not_load_materials_0911')">
      {{ t("examples.try_again_your_data_is_preserved_0912") }}
      <template #action><WlButton size="sm" @click="state = 'ready'">{{ t("examples.retry_0913") }}</WlButton></template>
    </WlAlert>
    <div v-else class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">{{ t("examples.project_materials_0914") }}</h3><ul class="content-state-list wl-text-body"><li v-for="material in materials" :key="material">{{ material }}</li></ul>
      <p class="wl-text-small wl-text-muted" role="status">{{ t("examples.available_materials_0915") }} {{ materials.length }}</p>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.local_example_states_switch_without_api_requests_0916") }}</p>
  </section>
</template>

<style scoped>
.content-state-list { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); }
</style>
