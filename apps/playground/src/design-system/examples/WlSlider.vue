<script setup lang="ts">
import { ref } from "vue";
import { WlSlider } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(40);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSlider v-model="value" :min="0" :max="100" :step="10" aria-label="Громкость" v-bind="preview" /><p class="wl-text-small">Громкость: {{ value }}%</p>
  </div>
</template>
