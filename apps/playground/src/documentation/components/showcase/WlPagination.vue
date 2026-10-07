<script setup lang="ts">
import { ref } from "vue";
import { WlPagination, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const page = ref(6);
const compactPage = ref(2);
const disabled = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="disabled">Отключить переходы страниц</WlCheckbox>
    <WlPagination v-model:page="page" :page-count="12" :siblings="1" :disabled="disabled" :pt="{ root: { 'aria-label': 'Страницы материалов' } }" />
    <WlPagination v-model:page="compactPage" :page-count="9" compact :disabled="disabled" :pt="{ root: { 'aria-label': 'Компактные страницы материалов' } }" />
    <p class="wl-text-small" role="status">Обычная: {{ page }} из 12. Компактная: {{ compactPage }} из 9.</p>
    <p class="wl-text-small wl-text-muted">В компактном поле Enter или потеря фокуса применяет номер; выход за границы ограничивается доступным диапазоном.</p>
  </div>
</template>
