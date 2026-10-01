<script setup lang="ts">
import { ref } from "vue";
import { WlCheckbox } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCheckbox v-model="value" v-bind="preview">Получать обновления</WlCheckbox>
  </div>
</template>
