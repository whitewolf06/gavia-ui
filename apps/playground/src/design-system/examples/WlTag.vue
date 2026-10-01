<script setup lang="ts">
import { ref } from "vue";
import { WlTag, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTag v-if="visible" removable remove-label="Убрать тег Дизайн" v-bind="preview" @remove="visible = false">Дизайн</WlTag><WlButton v-else size="sm" @click="visible = true">Вернуть тег</WlButton>
  </div>
</template>
