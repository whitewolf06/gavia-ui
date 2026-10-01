<script setup lang="ts">
import { WlDivider } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDivider v-bind="preview">Дополнительные сведения</WlDivider>
  </div>
</template>
