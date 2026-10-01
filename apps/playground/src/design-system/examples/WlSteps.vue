<script setup lang="ts">
import { ref } from "vue";
import { WlSteps, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const current = ref(1);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSteps :items="[{ label: 'Данные' }, { label: 'Доступ' }, { label: 'Проверка' }]" :current="current" v-bind="preview" /><WlButton size="sm" @click="current = (current + 1) % 3">Следующий шаг</WlButton>
  </div>
</template>
