<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useWlPt } from "../config";

const props = defineProps<{
  pt?: Record<string, unknown>;
}>();

const slots = useSlots();

const rootClass = computed(() => {
  const classes = ["wl-divider"];
  if (!slots.default) classes.push("wl-divider--plain");
  return classes;
});
const section = useWlPt("divider", computed(() => props.pt));
</script>

<template>
  <div v-bind="section('root')" :class="rootClass" role="separator" data-wl="divider">
    <span v-if="$slots.default" v-bind="section('content')"><slot /></span>
  </div>
</template>
