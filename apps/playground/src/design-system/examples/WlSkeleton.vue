<script setup lang="ts">
import { WlSkeleton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <div role="status" aria-label="Загрузка материалов" aria-busy="true"><WlSkeleton height="24px" v-bind="preview" /></div>
  </div>
</template>
