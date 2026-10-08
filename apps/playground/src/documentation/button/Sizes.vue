<script setup lang="ts">
import { computed, ref } from "vue";
import { WlButton, WlCheckbox, type WlDensity, type WlSize } from "../../../../../packages/ui-kit/src";
const labels = { xs: "XS", sm: "SM", md: "MD", lg: "LG" } satisfies Record<WlSize, string>;
const sizes = Object.keys(labels) as WlSize[];
const showCompact = ref(true);
const densities = computed<readonly WlDensity[]>(() => showCompact.value ? ["default", "compact"] : ["default"]);
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="showCompact">Показать компактный ряд</WlCheckbox>
    <div v-for="density in densities" :key="density" class="wl-stack" data-space="sm" :data-button-density="density">
      <h3 class="wl-text-label">{{ density === 'compact' ? 'Компактная плотность' : 'Обычная плотность' }}</h3>
      <div class="wl-inline" data-space="md">
        <WlButton v-for="size in sizes" :key="size" :size="size" :density="density" variant="primary">{{ labels[size] }}</WlButton>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted">size выбирает размер, density="compact" уменьшает высоту. Размеры берутся из токенов выбранной темы.</p>
  </div>
</template>
