<script setup lang="ts">
import { ref } from "vue";
import { WlCommandPalette, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(false);
const query = ref('');
const selected = ref('');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">Открыть команды</WlButton><WlCommandPalette v-model:visible="visible" v-model:query="query" aria-label="Команды материала" :groups="[{ id: 'actions', label: 'Действия', showWhenEmpty: true, items: [{ id: 'edit', label: 'Редактировать', icon: 'edit' }, { id: 'archive', label: 'Архивировать', icon: 'folder', disabled: true }] }]" v-bind="preview" @select="selected = $event.label" /><p v-if="selected" role="status">{{ selected }}</p>
  </div>
</template>
