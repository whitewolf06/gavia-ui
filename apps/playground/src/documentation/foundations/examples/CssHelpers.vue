<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <section class="wl-surface wl-stack" data-space="lg">
    <header class="wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t("examples.material_summary_0929") }}</h3><p class="wl-text-small wl-text-muted">{{ t("examples.the_surface_groups_related_parts_the_divider_separates_the_des_0930") }}</p></header>
    <hr class="wl-rule" />
    <div class="helpers-example-scroll wl-scroll-area" tabindex="0" role="region" :aria-label="t('examples.material_summary_scrollable_table_0931')">
      <table class="helpers-example-table">
        <caption class="wl-visually-hidden">{{ t("examples.materials_title_status_and_owner_0932") }}</caption>
        <thead><tr><th scope="col">{{ t("examples.title_0072") }}</th><th scope="col">{{ t("examples.status_0067") }}</th><th scope="col">{{ t("examples.owner_0624") }}</th></tr></thead>
        <tbody><tr><th scope="row">{{ t("examples.setup_instructions_0933") }}</th><td>{{ t("examples.in_review_0934") }}</td><td>{{ t("examples.interface_team_0935") }}</td></tr><tr><th scope="row">{{ t("examples.workspace_template_0936") }}</th><td>{{ t("examples.done_0047") }}</td><td>{{ t("examples.product_team_0937") }}</td></tr></tbody>
      </table>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.tab_focuses_the_table_arrow_keys_scroll_it_when_space_is_limit_0938") }}</p>
  </section>
</template>

<style scoped>
.helpers-example-scroll { border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); }
.helpers-example-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.helpers-example-table { width: 100%; min-width: 600px; border-collapse: collapse; text-align: left; font-size: var(--wl-type-small-size); }
.helpers-example-table th, .helpers-example-table td { padding: var(--wl-space-md); border-bottom: 1px solid var(--wl-border); }
.helpers-example-table thead { background: var(--wl-bg-soft); }
.helpers-example-table tbody tr:last-child th, .helpers-example-table tbody tr:last-child td { border-bottom: 0; }
</style>
