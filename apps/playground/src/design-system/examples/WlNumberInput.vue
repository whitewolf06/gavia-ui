<script setup lang="ts">
import { ref } from "vue";
import { WlNumberInput } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(3);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlNumberInput v-model="value" :min="1" :max="10" aria-label="Количество" v-bind="preview" />
  </div>
</template>
