<script setup lang="ts">
import Skeleton from "primevue/skeleton";

withDefaults(
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
</script>

<template>
  <Skeleton
    class="wl-skeleton"
    :width="width"
    :height="height"
    :borderRadius="borderRadius"
    :shape="shape"
    :pt="pt"
    data-wl="skeleton"
  />
</template>
