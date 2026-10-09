<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
const steps = [t("examples.research_0979"), t("examples.prototype_0996"), t("examples.development_0080"), t("examples.review_0129")];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_number_of_columns_depends_on_the_viewport_width_even_when_0997") }}</p>
    <div class="viewport-layout-example wl-grid" data-space="md">
      <article v-for="(step, index) in steps" :key="step" class="wl-surface wl-stack" data-space="sm">
        <span class="wl-text-code wl-text-muted">0{{ index + 1 }}</span>
        <h3 class="wl-text-subheading">{{ step }}</h3>
        <p class="wl-text-small">{{ t("examples.cards_preserve_reading_order_when_the_layout_changes_0998") }}</p>
      </article>
    </div>
    <p class="wl-text-small" role="status">{{ t("examples.current_breakpoint_0999") }}
      <span class="viewport-tier viewport-tier--base">{{ t("examples.below_640_px_1_column_1000") }}</span>
      <span class="viewport-tier viewport-tier--sm">{{ t("examples.sm_from_640_px_2_columns_1001") }}</span>
      <span class="viewport-tier viewport-tier--md">{{ t("examples.md_from_900_px_3_columns_1002") }}</span>
      <span class="viewport-tier viewport-tier--lg">{{ t("examples.lg_from_1200_px_4_columns_1003") }}</span>
    </p>
  </section>
</template>

<style scoped>
.viewport-layout-example { grid-template-columns: minmax(0, 1fr); }
.viewport-tier { display: none; }
.viewport-tier--base { display: inline; }
/* Numeric values follow wlBreakpoints; CSS cannot read that TypeScript object. */
@media (min-width: 640px) {
  .viewport-layout-example { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .viewport-tier--base { display: none; }
  .viewport-tier--sm { display: inline; }
}
@media (min-width: 900px) {
  .viewport-layout-example { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .viewport-tier--sm { display: none; }
  .viewport-tier--md { display: inline; }
}
@media (min-width: 1200px) {
  .viewport-layout-example { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .viewport-tier--md { display: none; }
  .viewport-tier--lg { display: inline; }
}
</style>
