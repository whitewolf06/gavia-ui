<script setup lang="ts">
import WlIcon from "./WlIcon.vue";
import type { WlIconInput } from "../types";

withDefaults(
  defineProps<{
    icon?: WlIconInput;
    title?: string;
    description?: string;
  }>(),
  {}
);
</script>

<template>
  <div class="wl-empty" data-wl="empty">
    <slot name="icon">
      <WlIcon v-if="icon" :name="icon" :size="26" class="wl-empty__icon" />
    </slot>
    <div v-if="title" class="wl-empty__title">{{ title }}</div>
    <div v-if="description || $slots.default" class="wl-empty__desc">
      <slot>{{ description }}</slot>
    </div>
    <div v-if="$slots.action" class="wl-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>
