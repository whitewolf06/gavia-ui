<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <div class="wl-grid" data-space="lg">
    <article v-for="number in 4" :key="number" class="wl-surface wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">{{ t("examples.column_0939") }} {{ number }}</h3>
      <p class="wl-text-body">{{ t("examples.equal_width_cards_each_at_least_wl_layout_grid_min_wide_0940") }}</p>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_gap_comes_from_data_space_lg_the_last_row_retains_the_same_0941") }}</p>
    </article>
  </div>
</template>
