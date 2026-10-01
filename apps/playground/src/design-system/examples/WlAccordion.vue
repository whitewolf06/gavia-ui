<script setup lang="ts">
import { ref } from "vue";
import { WlAccordion } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const open = ref<string[]>(['overview']);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAccordion v-model:open-keys="open" :items="[{ key: 'overview', title: 'Обзор', content: 'Общие правила работы.' }, { key: 'details', title: 'Подробности', content: 'Договорённости и примеры.' }, { key: 'locked', title: 'Недоступный раздел', disabled: true }]" v-bind="preview" />
  </div>
</template>
