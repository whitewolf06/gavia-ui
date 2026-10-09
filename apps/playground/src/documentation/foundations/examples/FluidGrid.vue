<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSelect } from "../../../../../../packages/ui-kit/src";
const minimum = ref("240px");
const gap = ref("20px");
const gutter = ref("24px");
const minimumOptions = ["180px", "240px", "320px"];
const gapOptions = ["12px", "20px", "32px"];
const gutterOptions = ["8px", "24px", "40px"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="fluid-grid-controls wl-grid" data-space="md">
      <div class="wl-stack" data-space="xs"><label for="responsive-minimum" class="wl-text-label">{{ t("examples.minimum_column_width_0942") }}</label><WlSelect id="responsive-minimum" v-model="minimum" :aria-label="t('examples.minimum_column_width_0942')" :options="minimumOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="responsive-gap" class="wl-text-label">{{ t("examples.grid_gap_0943") }}</label><WlSelect id="responsive-gap" v-model="gap" :aria-label="t('examples.grid_gap_0943')" :options="gapOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="responsive-gutter" class="wl-text-label">{{ t("examples.side_gutter_0944") }}</label><WlSelect id="responsive-gutter" v-model="gutter" :aria-label="t('examples.side_gutter_0944')" :options="gutterOptions" /></div>
    </div>
    <div class="fluid-grid-container wl-container wl-container--fluid" :style="{ '--wl-layout-grid-min': minimum, '--wl-layout-grid-gap': gap, '--wl-layout-page-gutter': gutter }">
      <!-- No data-space: this grid uses --wl-layout-grid-gap instead. -->
      <div class="wl-grid">
        <article v-for="index in 4" :key="index" class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.card_0945") }} {{ index }}</h3><p class="wl-text-small">{{ t("examples.auto_fit_chooses_the_number_of_columns_from_this_grid_s_width_0946") }}</p></article>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ t("examples.minimum_0947") }} {{ minimum }} · gap: {{ gap }} · gutter: {{ gutter }}{{ t("examples.these_values_apply_only_inside_the_example_0948") }}</p>
  </section>
</template>

<style scoped>
.fluid-grid-controls { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.fluid-grid-container { padding-block: var(--wl-space-md); background: var(--wl-bg-soft); border-radius: var(--wl-corner-surface); }
</style>
