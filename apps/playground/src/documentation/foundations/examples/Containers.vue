<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <section class="container-example wl-stack" data-space="lg">
    <div class="container-example-band">
      <div class="wl-container"><div class="container-example-body"><h3 class="wl-text-label">{{ t("examples.default_0604") }}</h3><code>wl-container</code><p class="wl-text-small">{{ t("examples.centering_page_max_and_side_gutter_0899") }}</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--narrow"><div class="container-example-body"><h3 class="wl-text-label">{{ t("examples.reading_0900") }}</h3><code>wl-container--narrow</code><p class="wl-text-small">{{ t("examples.maximum_wl_layout_reading_max_suitable_for_an_article_or_instr_0901") }}</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--fluid"><div class="container-example-body"><h3 class="wl-text-label">{{ t("examples.wide_workspace_0902") }}</h3><code>wl-container--fluid</code><p class="wl-text-small">{{ t("examples.all_available_width_side_spacing_is_preserved_0903") }}</p></div></div>
    </div>
    <div class="container-example-band">
      <div class="wl-container wl-container--full"><div class="container-example-body"><h3 class="wl-text-label">{{ t("examples.edge_to_edge_0904") }}</h3><code>wl-container--full</code><p class="wl-text-small">{{ t("examples.no_width_limit_or_gutter_the_content_supplies_its_own_padding_0905") }}</p></div></div>
    </div>
  </section>
</template>

<style scoped>
.container-example { min-width: 0; }
.container-example-band { background: var(--wl-accent-soft); border: 1px dashed var(--wl-accent); min-width: 0; }
.container-example-body { min-width: 0; background: var(--wl-bg-soft); color: var(--wl-text); padding: var(--wl-space-md); display: grid; gap: var(--wl-space-sm); overflow-wrap: anywhere; }
.container-example code { font: var(--wl-type-code-size)/var(--wl-type-code-line-height) var(--wl-mono); }
</style>
