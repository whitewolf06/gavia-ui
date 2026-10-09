<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSelect } from "../../../../../../packages/ui-kit/src";
const space = ref("lg");
const alignment = ref("stretch");
const spaceOptions = ["sm", "md", "lg", "xl", "2xl"];
const alignmentOptions = [
  { label: t("examples.start_0949"), value: "start" },
  { label: t("examples.center_0950"), value: "center" },
  { label: t("examples.stretch_0951"), value: "stretch" }
];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="alignment-example-controls wl-grid" data-space="md">
      <div class="wl-stack" data-space="xs"><label for="layout-gap" class="wl-text-label">{{ t("examples.gap_0952") }}</label><WlSelect id="layout-gap" v-model="space" :aria-label="t('examples.gap_0952')" :options="spaceOptions" /></div>
      <div class="wl-stack" data-space="xs"><label for="layout-alignment" class="wl-text-label">{{ t("examples.alignment_0953") }}</label><WlSelect id="layout-alignment" v-model="alignment" :aria-label="t('examples.alignment_0953')" :options="alignmentOptions" option-label="label" option-value="value" /></div>
    </div>
    <div class="alignment-example-grid wl-grid" :data-space="space" :style="{ alignItems: alignment }">
      <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.short_card_0954") }}</h3><p class="wl-text-body">{{ t("examples.one_short_thought_0955") }}</p></article>
      <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.more_content_0956") }}</h3><p class="wl-text-body">{{ t("examples.this_card_has_more_text_the_tallest_card_determines_the_row_he_0957") }}</p><p class="wl-text-small wl-text-muted">{{ t("examples.stretch_extends_adjacent_cards_start_and_center_preserve_their_0958") }}</p></article>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">Gap: {{ space }} · align-items: {{ alignment }}</p>
  </section>
</template>

<style scoped>
.alignment-example-controls { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.alignment-example-grid { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) { .alignment-example-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
