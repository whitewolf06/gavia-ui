<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlButton, WlCheckbox, type WlDensity, type WlSize } from "../../../../../packages/ui-kit/src";
const labels = { xs: "XS", sm: "SM", md: "MD", lg: "LG" } satisfies Record<WlSize, string>;
const sizes = Object.keys(labels) as WlSize[];
const showCompact = ref(true);
const densities = computed<readonly WlDensity[]>(() => showCompact.value ? ["default", "compact"] : ["default"]);
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="showCompact">{{ t("examples.show_compact_row_0266") }}</WlCheckbox>
    <div v-for="density in densities" :key="density" class="wl-stack" data-space="sm" :data-button-density="density">
      <h3 class="wl-text-label">{{ density === 'compact' ? t("examples.compact_density_0267") : t("examples.default_density_0268") }}</h3>
      <div class="wl-inline" data-space="md">
        <WlButton v-for="size in sizes" :key="size" :size="size" :density="density" variant="primary">{{ labels[size] }}</WlButton>
      </div>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.size_selects_the_size_density_compact_reduces_the_height_sizes_0269") }}</p>
  </div>
</template>
