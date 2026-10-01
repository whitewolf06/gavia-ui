<script setup lang="ts">
import { WlAvatar } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAvatar label="АМ" presence="online" aria-label="Анна Михайлова, в сети" v-bind="preview" />
  </div>
</template>
