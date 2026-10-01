<script setup lang="ts">
import { ref } from "vue";
import { WlCalendar } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('2026-10-15');
const month = ref('2026-10');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCalendar v-model="value" v-model:month="month" :events="[{ date: '2026-10-15', label: 'Обзор', tone: 'blue' }]" v-bind="preview" /><p class="wl-text-small">Выбрано: {{ value }}</p>
  </div>
</template>
