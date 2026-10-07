<script setup lang="ts">
import { ref } from "vue";
import { WlSteps, WlButton, type WlStepItem } from "../../../../../../packages/ui-kit/src";
const current = ref(1);
const items: WlStepItem[] = [{ label: "Данные" }, { label: "Проверка" }, { label: "Готово" }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlSteps :items="items" :current="current" role="group" aria-label="Этапы подготовки материала" />
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="current === 0" @click="current--">Назад по шагам</WlButton><WlButton size="sm" variant="primary" :disabled="current === items.length - 1" @click="current++">Далее по шагам</WlButton><WlButton size="sm" variant="ghost" @click="current = 0">Начать сначала</WlButton></div>
    <p class="wl-text-small" role="status">Шаг {{ current + 1 }} из {{ items.length }}: {{ items[current]?.label }}.</p>
    <p class="wl-text-small wl-text-muted">Индикатор не переключает шаги сам: current и действия принадлежат приложению.</p>
  </div>
</template>
