<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSelect, WlIcon } from "../../../../../../packages/ui-kit/src";
const width = ref("420px");
const widthOptions = ["280px", "420px", "640px"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="container-card-control wl-stack" data-space="xs"><label for="responsive-container-width" class="wl-text-label">{{ t("examples.container_width_0894") }}</label><WlSelect id="responsive-container-width" v-model="width" :aria-label="t('examples.container_width_0894')" :options="widthOptions" /></div>
    <div class="container-card-host" :style="{ width: 'min(100%, ' + width + ')' }">
      <article class="container-card-body wl-surface">
        <div class="container-card-illustration" aria-hidden="true"><WlIcon name="grid" :size="36" /></div>
        <div class="wl-stack" data-space="sm"><h3 class="container-card-heading wl-text-subheading">{{ t("examples.card_in_a_narrow_and_wide_container_0895") }}</h3><p class="wl-text-body">{{ t("examples.the_card_uses_one_column_in_a_narrow_sidebar_and_two_in_a_wide_0896") }}</p></div>
      </article>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ t("examples.requested_0897") }} {{ width }}{{ t("examples.the_parent_limits_the_container_width_two_columns_appear_at_an_0898") }}</p>
  </section>
</template>

<style scoped>
.container-card-control { max-width: 240px; }
.container-card-host { container-type: inline-size; container-name: gavia-card; max-width: 100%; }
.container-card-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-lg); }
.container-card-illustration { display: grid; place-items: center; min-height: 96px; border-radius: var(--wl-corner-surface); color: var(--wl-text-accent); background: var(--wl-accent-soft); }
@container gavia-card (min-width: 420px) {
  .container-card-body { grid-template-columns: 96px minmax(0, 1fr); align-items: center; }
}
@container gavia-card (min-width: 560px) {
  .container-card-heading { font-size: var(--wl-type-heading-size); }
}
</style>
