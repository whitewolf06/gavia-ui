<script setup lang="ts">
import { ref } from "vue";
import { WlSegmented } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selected = ref<string | null>('list');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSegmented v-model="selected" :options="[{ label: 'Список', value: 'list' }, { label: 'Сетка', value: 'grid' }, { label: 'Архив', value: 'archive', disabled: true }]" aria-label="Представление" v-bind="preview" />
  </div>
</template>
