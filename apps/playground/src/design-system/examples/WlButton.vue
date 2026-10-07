<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlIcon } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const count = ref(0);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <div>
      <WlButton v-bind="preview" @click="count++"><template #icon><WlIcon name="plus" /></template>Добавить</WlButton>
    </div>
    <p role="status" class="wl-text-small">Действий: {{ count }}</p>
  </div>
</template>
