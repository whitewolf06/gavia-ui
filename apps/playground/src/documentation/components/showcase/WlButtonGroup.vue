<script setup lang="ts">
import { ref } from "vue";
import { WlButtonGroup, WlButton, WlIconButton } from "../../../../../../packages/ui-kit/src";
const period = ref("День");
const page = ref(1);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlButtonGroup aria-label="Период отчёта"><WlButton v-for="label in ['День', 'Неделя', 'Месяц']" :key="label" size="sm" :variant="period === label ? 'primary' : 'secondary'" :aria-pressed="period === label" @click="period = label">{{ label }}</WlButton></WlButtonGroup></div>
    <div><WlButtonGroup aria-label="Страницы отчёта"><WlIconButton icon="chevron-left" variant="secondary" aria-label="Предыдущая страница отчёта" :disabled="page === 1" @click="page--" /><WlIconButton icon="chevron-right" variant="secondary" aria-label="Следующая страница отчёта" :disabled="page === 5" @click="page++" /></WlButtonGroup></div>
    <p class="wl-text-small" role="status">Период: {{ period }}. Страница: {{ page }} из 5.</p>
    <p class="wl-text-small wl-text-muted">Группа объединяет рамки и задаёт role="group"; состояние выбора хранит приложение.</p>
  </div>
</template>
