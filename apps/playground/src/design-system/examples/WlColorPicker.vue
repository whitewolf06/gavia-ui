<script setup lang="ts">
import { ref } from "vue";
import { WlColorPicker } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('#3c6cff');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlColorPicker v-model="value" palette-label="Цвет материала" input-label="HEX-код цвета материала" v-bind="preview" />
  </div>
</template>
