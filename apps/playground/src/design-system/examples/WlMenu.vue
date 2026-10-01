<script setup lang="ts">
import { ref } from "vue";
import { WlMenu } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selection = ref('Выберите действие');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMenu :items="[{ header: 'Материал' }, { key: 'edit', label: 'Редактировать', icon: 'edit', command: () => selection = 'Редактирование' }, { key: 'lock', label: 'Недоступно', disabled: true }, { separator: true }, { key: 'delete', label: 'Удалить', icon: 'trash', danger: true, command: () => selection = 'Удаление' }]" aria-label="Действия материала" v-bind="preview" /><p role="status" class="wl-text-small">{{ selection }}</p>
  </div>
</template>
