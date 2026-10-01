<script setup lang="ts">
import { ref } from "vue";
import { WlButtonGroup, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selected = ref('day');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButtonGroup aria-label="Период" v-bind="preview"><WlButton :variant="selected === 'day' ? 'primary' : 'secondary'" @click="selected = 'day'">День</WlButton><WlButton :variant="selected === 'week' ? 'primary' : 'secondary'" @click="selected = 'week'">Неделя</WlButton></WlButtonGroup>
  </div>
</template>
