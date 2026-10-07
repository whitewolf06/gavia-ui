<script setup lang="ts">
import { computed } from "vue";
import { WlProgress } from "../../../../packages/ui-kit/src";

const props = defineProps<{ value: number; label: string }>();
const percentage = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const valueText = computed(() => percentage.format(props.value) + "%");
</script>

<template>
  <div class="quality-meter wl-stack" data-space="xs">
    <WlProgress class="quality-meter-bar" :value="value" :aria-label="label" :aria-valuetext="valueText" />
    <div class="quality-meter-scale wl-text-small wl-text-muted" aria-hidden="true"><span>0%</span><span>100%</span></div>
  </div>
</template>

<style scoped>
.quality-meter-bar { max-width: none; height: var(--wl-space-sm); border-radius: var(--wl-corner-control); }
.quality-meter-bar :deep(.wl-progress__value) { border-radius: inherit; transform-origin: left; animation: quality-meter-reveal var(--wl-dur-3) var(--wl-ease); }
.quality-meter-scale { display: flex; justify-content: space-between; }
@keyframes quality-meter-reveal { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .quality-meter-bar :deep(.wl-progress__value) { animation: none; transition: none; } }
</style>
