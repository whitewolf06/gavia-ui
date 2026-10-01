<script setup lang="ts">
import { ref } from "vue";
import { WlInput, WlIcon } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('Материал команды');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlInput v-model="value" aria-label="Название материала" placeholder="Название" :pt="{ input: { 'data-example': 'material-title' } }" v-bind="preview"><template #prefix><WlIcon name="file" /></template></WlInput>
  </div>
</template>
