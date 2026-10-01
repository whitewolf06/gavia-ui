<script setup lang="ts">
import { WlBadge } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlBadge :value="12" v-bind="preview" />
  </div>
</template>
