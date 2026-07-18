<script setup lang="ts">
import { computed, useSlots } from "vue";
import Divider from "primevue/divider";

defineProps<{
  pt?: Record<string, unknown>;
}>();

const slots = useSlots();

const rootClass = computed(() => {
  const classes = ["wl-divider"];
  if (!slots.default) classes.push("wl-divider--plain");
  return classes;
});
</script>

<template>
  <Divider :class="rootClass" :pt="pt" data-wl="divider">
    <slot v-if="$slots.default" />
  </Divider>
</template>
