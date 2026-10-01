<script setup lang="ts">
import { WlProgress } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlProgress :value="65" show-value aria-label="Готовность материалов" v-bind="preview" />
  </div>
</template>
