<script setup lang="ts">
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
      <div class="wl-stack" data-space="xs"><label for="asset-icon-name" class="wl-text-label">Имя иконки</label><WlSelect id="asset-icon-name" :model-value="name" :options="[...WL_ICON_NAMES]" aria-label="Имя иконки" @update:model-value="chooseName" /></div>
      <div class="wl-stack" data-space="xs"><label for="asset-icon-size" class="wl-text-label">Размер иконки</label><WlSelect id="asset-icon-size" :model-value="size" :options="comparisonSizes" aria-label="Размер иконки" @update:model-value="chooseSize" /></div>
    </div>
    <div class="icon-playground-selected wl-inline" data-space="md">
      <span role="img" :aria-label="'Иконка ' + name + ', ' + size + ' px'"><WlIcon :name="name" :size="size" /></span>
      <p class="wl-text-body" role="status">Выбрано: {{ name }} · {{ size }} px</p>
    </div>
    <div class="icon-playground-comparison" aria-label="Сравнение размеров">
      <figure v-for="comparisonSize in comparisonSizes" :key="comparisonSize" class="icon-playground-sample" :data-icon-comparison-size="comparisonSize">
        <WlIcon :name="name" :size="comparisonSize" /><figcaption class="wl-text-small">{{ comparisonSize }} px</figcaption>
      </figure>
    </div>
    <p class="wl-text-small wl-text-muted">SVG наследует currentColor. Установите color на контейнере или действии; размер в пикселях передаётся числом.</p>
  </section>
</template>

<style scoped>
.icon-playground { min-width: 0; }
.icon-playground-selected { min-height: 80px; padding: var(--wl-space-lg); background: var(--wl-bg-soft); border-radius: var(--wl-corner-control); color: var(--wl-accent); }
.icon-playground-selected p { color: var(--wl-text); }
.icon-playground-comparison { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 80px), 1fr)); gap: var(--wl-space-sm); }
.icon-playground-sample { margin: 0; min-width: 0; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); color: var(--wl-text); }
</style>
