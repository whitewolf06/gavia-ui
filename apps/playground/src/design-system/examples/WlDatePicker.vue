<script setup lang="ts">
import { ref } from "vue";
import { WlDatePicker } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>('2026-10-15');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDatePicker v-model="value" show-icon min-date="2026-10-01" max-date="2026-10-31" aria-label="Дата в октябре" v-bind="preview" />
  </div>
</template>
