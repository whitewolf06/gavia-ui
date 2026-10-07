<script setup lang="ts">
import { ref } from "vue";
import { WlSegmented, type WlSegmentedOption } from "../../../../../../packages/ui-kit/src";
const period = ref<string | null>("week");
const view = ref<string | null>("list");
const periods: WlSegmentedOption[] = [{ label: "День", value: "day" }, { label: "Неделя", value: "week" }, { label: "Месяц", value: "month" }, { label: "Год", value: "year", disabled: true }];
const views: WlSegmentedOption[] = [{ label: "Список", value: "list", icon: "list" }, { label: "Сетка", value: "grid", icon: "grid" }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlSegmented v-model="period" :options="periods" aria-label="Период планирования" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" />
    <WlSegmented v-model="view" :options="views" aria-label="Вид материалов" />
    <WlSegmented model-value="list" :options="views" disabled aria-label="Недоступный вид материалов" />
    <p class="wl-text-small" role="status">Период: {{ periods.find(item => item.value === period)?.label }}. Вид: {{ views.find(item => item.value === view)?.label }}.</p>
  </div>
</template>
