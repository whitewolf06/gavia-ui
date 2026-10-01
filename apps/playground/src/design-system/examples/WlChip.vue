<script setup lang="ts">
import { ref } from "vue";
import { WlChip } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlChip v-model:active="active" :count="5" v-bind="preview">Материалы</WlChip>
  </div>
</template>
