<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WL_ICON_NAMES, WlIcon, WlSelect, type WlIconName } from "../../../../../../packages/ui-kit/src";
const name = defineModel<WlIconName>("name", { default: "folder" });
const size = defineModel<number>("size", { default: 24 });
const comparisonSizes = [16, 20, 24, 32, 48];
function chooseName(value: unknown): void {
  if (typeof value === "string" && (WL_ICON_NAMES as readonly string[]).includes(value)) name.value = value as WlIconName;
}
function chooseSize(value: unknown): void {
  if (typeof value === "number" && comparisonSizes.includes(value)) size.value = value;
}
</script>

<template>
  <section class="icon-playground wl-stack" data-space="lg">
    <div class="wl-grid" data-space="md">
      <div class="wl-stack" data-space="xs"><label for="asset-icon-name" class="wl-text-label">{{ t("examples.icon_name_1033") }}</label><WlSelect id="asset-icon-name" :model-value="name" :options="[...WL_ICON_NAMES]" :aria-label="t('examples.icon_name_1033')" @update:model-value="chooseName" /></div>
      <div class="wl-stack" data-space="xs"><label for="asset-icon-size" class="wl-text-label">{{ t("examples.icon_size_1034") }}</label><WlSelect id="asset-icon-size" :model-value="size" :options="comparisonSizes" :aria-label="t('examples.icon_size_1034')" @update:model-value="chooseSize" /></div>
    </div>
    <div class="icon-playground-selected wl-inline" data-space="md">
      <span role="img" :aria-label="t('examples.icon_1035') + name + ', ' + size + ' px'"><WlIcon :name="name" :size="size" /></span>
      <p class="wl-text-body" role="status">{{ t("examples.selected_0022") }} {{ name }} · {{ size }} px</p>
    </div>
    <div class="icon-playground-comparison" :aria-label="t('examples.size_comparison_1036')">
      <figure v-for="comparisonSize in comparisonSizes" :key="comparisonSize" class="icon-playground-sample" :data-icon-comparison-size="comparisonSize">
        <WlIcon :name="name" :size="comparisonSize" /><figcaption class="wl-text-small">{{ comparisonSize }} px</figcaption>
      </figure>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.svg_inherits_currentcolor_set_color_on_the_container_or_action_1037") }}</p>
  </section>
</template>

<style scoped>
.icon-playground { min-width: 0; }
.icon-playground-selected { min-height: 80px; padding: var(--wl-space-lg); background: var(--wl-bg-soft); border-radius: var(--wl-corner-control); color: var(--wl-text-accent); }
.icon-playground-selected p { color: var(--wl-text); }
.icon-playground-comparison { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 80px), 1fr)); gap: var(--wl-space-sm); }
.icon-playground-sample { margin: 0; min-width: 0; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); color: var(--wl-text); }
</style>
