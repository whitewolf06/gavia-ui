<script setup lang="ts">
import Toast from "primevue/toast";

withDefaults(
  defineProps<{
    group?: string;
    pt?: Record<string, unknown>;
  }>(),
  {}
);
</script>

<template>
  <Toast
    position="bottom-center"
    :auto-z-index="false"
    :group="group"
    :pt="pt"
    class="wl-toast"
    data-wl="toast"
  />
</template>
