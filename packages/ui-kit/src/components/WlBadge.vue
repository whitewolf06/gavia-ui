<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
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
const section = useWlPt("badge", computed(() => props.pt));
</script>

<template>
  <span v-bind="section('root')" :class="rootClass" data-wl="badge" :data-variant="variant">
    {{ dot ? "" : value }}
  </span>
</template>
