<script setup lang="ts">
import { WlSpinner } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <div class="wl-inline" style="background: var(--wl-gray-950); padding: var(--wl-space-md); border-radius: var(--wl-radius-sm)"><WlSpinner label="Загрузка материала" v-bind="preview" /></div>
  </div>
</template>
