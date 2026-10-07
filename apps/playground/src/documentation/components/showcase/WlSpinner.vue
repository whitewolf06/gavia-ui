<script setup lang="ts">
import { ref } from "vue";
import { WlSpinner, WlButton } from "../../../../../../packages/ui-kit/src";
const busy = ref(true);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="lg"><WlSpinner size="sm" label="Маленький индикатор загрузки" /><WlSpinner size="md" label="Средний индикатор загрузки" /><WlSpinner size="lg" label="Большой индикатор загрузки" /><span class="showcase-spinner-dark"><WlSpinner light label="Светлый индикатор на тёмном фоне" /></span></div>
    <div class="wl-inline" data-space="sm"><WlSpinner v-if="busy" label="Загрузка материалов" /><span>{{ busy ? 'Загружаем материалы…' : 'Материалы готовы.' }}</span></div>
    <div><WlButton @click="busy = !busy">{{ busy ? 'Завершить загрузку' : 'Повторить загрузку' }}</WlButton></div>
  </div>
</template>
<style scoped>
.showcase-spinner-dark { display: inline-flex; padding: var(--wl-space-md); border-radius: var(--wl-corner-control); background: var(--wl-gray-800); }
</style>
