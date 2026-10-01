<script setup lang="ts">
import { WlIconButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlIconButton icon="bell" aria-label="Уведомления" :count="3" v-bind="preview" />
  </div>
</template>
