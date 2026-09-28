<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    borderRadius?: string;
    shape?: "rectangle" | "circle";
    pt?: Record<string, unknown>;
  }>(),
  {
    width: "100%",
    height: "12px",
    shape: "rectangle"
  }
);
const section = useWlPt("skeleton", computed(() => props.pt));
</script>

<template>
  <span v-bind="section('root')" class="wl-skeleton" aria-hidden="true" data-wl="skeleton"
    :style="{ width, height, borderRadius: shape === 'circle' ? '50%' : borderRadius }" />
</template>
