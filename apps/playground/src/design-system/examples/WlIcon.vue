<script setup lang="ts">
import { WlIcon } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlIcon name="folder" :size="24" role="img" aria-label="Папка материалов" v-bind="preview" />
  </div>
</template>
