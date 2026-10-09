<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton } from "../../../../../../packages/ui-kit/src";
const projects = [t("examples.research_0979"), t("examples.design_0980"), t("examples.review_0129")];
const selected = ref("");
</script>

<template>
  <section class="wl-stack" data-space="xl">
    <div class="responsive-example-grid wl-grid" data-space="lg">
      <article v-for="project in projects" :key="project" class="wl-surface wl-stack" data-space="md">
        <h3 class="wl-text-subheading">{{ project }}</h3>
        <p class="wl-text-body wl-text-muted">{{ t("examples.cards_adapt_to_the_available_width_and_preserve_reading_order_0981") }}</p>
        <div><WlButton size="sm" :aria-label="t('examples.select_0982') + project" @click="selected = project">{{ t("examples.select_0983") }}</WlButton></div>
      </article>
    </div>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" @click="selected = t('examples.new_project_0241')">{{ t("examples.add_project_0984") }}</WlButton>
      <WlButton @click="selected = ''">{{ t("examples.reset_selection_0985") }}</WlButton>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ selected ? t("examples.selected_0059") + selected : t("examples.select_a_card_actions_wrap_to_the_next_line_0986") }}</p>
  </section>
</template>

<style scoped>
/* The public primitive uses auto-fit; this application chooses explicit viewport tiers. */
.responsive-example-grid { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) { .responsive-example-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 900px) { .responsive-example-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
