<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <section class="color-roles-example wl-stack" data-space="lg">
    <article class="color-roles-example-surface wl-stack" data-space="md"><h4 class="wl-text-subheading">{{ t("examples.team_materials_0083") }}</h4><p class="wl-text-body">{{ t("examples.body_text_uses_wl_text_on_wl_bg_1004") }}</p><p class="wl-text-small wl-text-muted">{{ t("examples.the_explanation_inherits_wl_text_muted_the_border_uses_wl_bord_1005") }}</p></article>
    <div class="color-roles-example-accent wl-stack" data-space="sm"><h4 class="wl-text-label">{{ t("examples.selected_section_1006") }}</h4><p class="wl-text-small">{{ t("examples.soft_highlight_wl_accent_soft_and_wl_accent_border_the_title_r_1007") }}</p></div>
    <p class="color-roles-example-help wl-text-small">{{ t("examples.the_secondary_area_uses_wl_bg_soft_css_stays_the_same_when_swi_1008") }}</p>
  </section>
</template>

<style scoped>
.color-roles-example { min-width: 0; }
.color-roles-example-surface { min-width: 0; padding: var(--wl-space-lg); background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.color-roles-example-accent { min-width: 0; padding: var(--wl-space-md); background: var(--wl-accent-soft); color: var(--wl-text); border: 1px solid var(--wl-accent-border); border-radius: var(--wl-corner-control); }
.color-roles-example-help { padding: var(--wl-space-md); background: var(--wl-bg-soft); color: var(--wl-text-muted); border-radius: var(--wl-corner-control); }
</style>
