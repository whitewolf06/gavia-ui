<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCalendar } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('2026-10-15');
const month = ref('2026-10');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCalendar v-model="value" v-model:month="month" :events="[{ date: '2026-10-15', label: t('examples.overview_0000'), tone: 'blue' }]" v-bind="preview" /><p class="wl-text-small">{{ t("examples.selected_0022") }} {{ value }}</p>
  </div>
</template>
