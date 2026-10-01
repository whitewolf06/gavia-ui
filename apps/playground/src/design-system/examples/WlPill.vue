<script setup lang="ts">
import { WlPill } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPill label="В работе" v-bind="preview" />
  </div>
</template>
