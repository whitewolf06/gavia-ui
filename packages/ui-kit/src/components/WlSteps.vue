<script setup lang="ts">
import WlIcon from "./WlIcon.vue";
import type { WlStepItem } from "../types";

withDefaults(
  defineProps<{
    items?: readonly WlStepItem[];
    current?: number;
  }>(),
  {
    items: () => [],
    current: 0
  }
);
</script>

<template>
  <div class="wl-steps" data-wl="steps">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="wl-steps__line" aria-hidden="true" />
      <span
        class="wl-steps__step"
        :class="{ 'is-done': index < current, 'is-current': index === current }"
        :aria-current="index === current ? 'step' : undefined"
      >
        <span class="wl-steps__num">
          <WlIcon v-if="index < current" name="check" :size="12" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="wl-steps__label">{{ item.label }}</span>
      </span>
    </template>
  </div>
</template>
