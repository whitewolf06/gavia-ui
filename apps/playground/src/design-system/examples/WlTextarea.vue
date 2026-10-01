<script setup lang="ts">
import { ref } from "vue";
import { WlTextarea } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('Описание материала.\nСледующая строка сохраняется.');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTextarea v-model="value" aria-label="Описание материала" :rows="3" auto-resize v-bind="preview" />
  </div>
</template>
