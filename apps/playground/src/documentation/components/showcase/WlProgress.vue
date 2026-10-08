<script setup lang="ts">
import { ref } from "vue";
import { WlProgress, WlButton } from "../../../../../../packages/ui-kit/src";
const value = ref(40);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlProgress :value="64" aria-label="Обычный прогресс" /><WlProgress :value="32" thin aria-label="Тонкий прогресс" /><WlProgress :value="100" variant="ok" aria-label="Завершённая операция" />
    <WlProgress :value="value" :variant="value === 100 ? 'ok' : 'default'" show-value aria-label="Прогресс локальной подготовки" />
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="value === 100" @click="value = Math.min(100, value + 20)">Добавить 20%</WlButton><WlButton size="sm" variant="ghost" @click="value = 0">Начать заново</WlButton></div>
    <p class="wl-text-small" role="status">{{ value === 100 ? 'Подготовка завершена.' : 'Подготовлено: ' + value + '%.' }}</p>
  </div>
</template>
