<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <div class="wl-grid" data-space="xl">
    <section v-for="category in [t('examples.in_progress_0066'), t('examples.in_review_0934')]" :key="category" class="wl-surface wl-stack" data-space="lg">
      <h3 class="wl-text-subheading">{{ category }}</h3>
      <div class="wl-grid" data-space="sm">
        <article v-for="number in 2" :key="number" class="nested-example-item wl-stack" data-space="sm"><h4 class="wl-text-label">{{ t("examples.material_0074") }} {{ number }}</h4><p class="wl-text-small">{{ t("examples.the_inner_grid_depends_on_this_group_s_width_0970") }}</p></article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nested-example-item { min-width: 0; padding: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); }
</style>
