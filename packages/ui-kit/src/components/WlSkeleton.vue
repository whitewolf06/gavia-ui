<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    borderRadius?: string;
    shape?: "rectangle" | "circle";
    pt?: WlPt<"skeleton">;
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
