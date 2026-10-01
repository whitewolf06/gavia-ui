<script setup lang="ts">
import { ref } from "vue";
import { WlSwitch } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSwitch v-model="value" aria-label="Уведомления по email" v-bind="preview">Уведомления по email</WlSwitch>
  </div>
</template>
