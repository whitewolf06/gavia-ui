<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton } from "../../../../../../packages/ui-kit/src";
const folders = [t("examples.all_materials_0091"), t("examples.my_materials_0971"), t("examples.archive_0113")];
const selected = ref(t("examples.all_materials_0091"));
</script>

<template>
  <div class="composition-example wl-grid" data-space="lg">
    <aside class="wl-surface wl-stack" data-space="md" :aria-label="t('examples.material_sections_0972')">
      <h3 class="wl-text-subheading">{{ t("examples.materials_0015") }}</h3>
      <WlButton v-for="folder in folders" :key="folder" block :variant="selected === folder ? 'primary' : 'ghost'" :aria-pressed="selected === folder" @click="selected = folder">{{ folder }}</WlButton>
    </aside>
    <section class="wl-surface wl-stack" data-space="lg">
      <header class="wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ selected }}</h3><p class="wl-text-body wl-text-muted">{{ t("examples.choose_a_section_in_the_sidebar_its_content_appears_in_the_mai_0973") }}</p></header>
      <div class="wl-grid" data-space="md"><article class="composition-example-card wl-stack" data-space="sm"><h4 class="wl-text-label">{{ t("examples.instructions_0974") }}</h4><p class="wl-text-small">{{ t("examples.the_area_order_is_preserved_on_mobile_0975") }}</p></article><article class="composition-example-card wl-stack" data-space="sm"><h4 class="wl-text-label">{{ t("examples.template_0976") }}</h4><p class="wl-text-small">{{ t("examples.the_main_column_can_shrink_thanks_to_minmax_0_1fr_0977") }}</p></article></div>
      <p class="wl-text-small wl-text-muted" role="status">{{ t("examples.section_0978") }} {{ selected }}</p>
    </section>
  </div>
</template>

<style scoped>
.composition-example { grid-template-columns: minmax(0, 1fr); }
.composition-example-card { min-width: 0; padding: var(--wl-space-md); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }
@media (min-width: 900px) { .composition-example { grid-template-columns: 200px minmax(0, 1fr); } }
</style>
