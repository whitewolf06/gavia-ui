<script setup lang="ts">
import { computed } from "vue";
import WlCard from "./WlCard.vue";
import WlIcon from "./WlIcon.vue";
import type { WlIconName, WlStatCardTone } from "../types";

const props = withDefaults(
  defineProps<{
    icon?: WlIconName;
    label?: string;
    value?: string;
    description?: string;
    progress?: number;
    tone?: WlStatCardTone;
  }>(),
  {
    tone: "accent"
  }
);

const pct = computed(() => Math.min(Math.max(props.progress ?? 0, 0), 100));
</script>

<template>
  <WlCard class="wl-stat-card" data-wl="stat-card" :data-tone="tone">
    <div v-if="icon || label" class="wl-stat-card__label">
      <WlIcon v-if="icon" :name="icon" :size="14" />
      <span>{{ label }}</span>
    </div>
    <div class="wl-stat-card__value"><slot>{{ value }}</slot></div>
    <div v-if="description" class="wl-stat-card__desc">{{ description }}</div>
    <div
      v-if="progress !== undefined"
      class="wl-stat-card__bar"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <i class="wl-stat-card__bar-fill" :style="{ width: `${pct}%` }" />
    </div>
    <div v-if="$slots.footer" class="wl-stat-card__footer">
      <slot name="footer" />
    </div>
  </WlCard>
</template>
