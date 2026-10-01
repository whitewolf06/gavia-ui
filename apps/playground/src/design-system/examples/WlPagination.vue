<script setup lang="ts">
import { ref } from "vue";
import { WlPagination } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const page = ref(1);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPagination v-model:page="page" :page-count="12" v-bind="preview" /><p class="wl-text-small" role="status">Страница {{ page }} из 12</p>
  </div>
</template>
