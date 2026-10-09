<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <section class="wl-stack" data-space="lg">
    <div class="proportion-example wl-grid" data-space="md">
      <article class="proportion-example-wide wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.8_of_12_0888") }}</h3><p class="wl-text-body">{{ t("examples.the_main_block_occupies_two_thirds_of_the_width_0889") }}</p></article>
      <aside class="proportion-example-aside wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.4_of_12_0890") }}</h3><p class="wl-text-body">{{ t("examples.explanations_and_additional_actions_0891") }}</p></aside>
      <article class="proportion-example-half wl-surface"><h3 class="wl-text-label">{{ t("examples.6_of_12_0892") }}</h3></article>
      <article class="proportion-example-half wl-surface"><h3 class="wl-text-label">{{ t("examples.6_of_12_0892") }}</h3></article>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.one_span_is_one_of_12_available_columns_after_subtracting_gap_0893") }}</p>
  </section>
</template>

<style scoped>
/* These classes belong to the application; Gavia does not define wl-col-* helpers. */
.proportion-example { grid-template-columns: repeat(12, minmax(0, 1fr)); }
.proportion-example-wide, .proportion-example-aside, .proportion-example-half { grid-column: span 12; min-width: 0; }
@media (min-width: 900px) {
  .proportion-example-wide { grid-column: span 8; }
  .proportion-example-aside { grid-column: span 4; }
  .proportion-example-half { grid-column: span 6; }
}
</style>
