<script setup lang="ts">
import { computed, useSlots } from "vue";
import Card from "primevue/card";

const props = withDefaults(
  defineProps<{
    hoverable?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    hoverable: false
  }
);

const slots = useSlots();

const rootClass = computed(() => ["wl-card", props.hoverable && "wl-card--hoverable"]);
</script>

<template>
  <Card :class="rootClass" :pt="pt" data-wl="card">
    <template v-if="slots.header" #header><slot name="header" /></template>
    <template v-if="slots.title" #title><slot name="title" /></template>
    <template v-if="slots.subtitle" #subtitle><slot name="subtitle" /></template>
    <template #content><slot /></template>
    <template v-if="slots.footer" #footer><slot name="footer" /></template>
  </Card>
</template>
