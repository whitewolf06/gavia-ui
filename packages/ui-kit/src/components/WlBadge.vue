<script setup lang="ts">
import { computed } from "vue";
import Badge from "primevue/badge";
import type { WlBadgeVariant } from "../types";

const props = withDefaults(
  defineProps<{
    value?: string | number;
    variant?: WlBadgeVariant;
    dot?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    variant: "accent",
    dot: false
  }
);

const rootClass = computed(() => [
  "wl-badge",
  `wl-badge--${props.variant}`,
  props.dot && "wl-badge--dot"
]);
</script>

<template>
  <Badge
    :value="dot ? undefined : value"
    :class="rootClass"
    :pt="pt"
    data-wl="badge"
    :data-variant="variant"
  />
</template>
