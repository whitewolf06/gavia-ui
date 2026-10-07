<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlCheckbox, WlIcon } from "../../../../../packages/ui-kit/src";
const noAccess = ref(false);
const loading = ref(false);
const saved = ref(0);
const message = ref("Нажмите «Сохранить», затем завершите или отмените локальную загрузку.");
function finish(): void {
  loading.value = false;
  saved.value++;
  message.value = "Сохранение завершено.";
}
function cancel(): void {
  loading.value = false;
  message.value = "Загрузка отменена. Можно повторить сохранение.";
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md">
      <WlButton disabled aria-describedby="button-disabled-reason">Недоступно</WlButton>
      <WlButton variant="primary" loading>Сохранение…</WlButton>
    </div>
    <p id="button-disabled-reason" class="wl-text-small wl-text-muted">Disabled блокирует действие. Loading тоже блокирует кнопку и заменяет icon-слот спиннером.</p>
    <WlCheckbox v-model="noAccess">Нет прав на сохранение</WlCheckbox>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" :disabled="noAccess" :loading="loading" aria-describedby="button-saving-reason" @click="loading = true">
        <template #icon><WlIcon name="check" :size="16" /></template>
        {{ loading ? 'Сохраняем…' : 'Сохранить' }}
      </WlButton>
      <WlButton v-if="loading" @click="finish">Завершить сохранение</WlButton>
      <WlButton v-if="loading" variant="ghost" @click="cancel">Отменить загрузку</WlButton>
    </div>
    <p id="button-saving-reason" class="wl-text-small wl-text-muted">{{ noAccess ? 'Для этого действия нужны права на редактирование.' : 'Демо не отправляет запросы: завершение и отмена управляются вручную.' }}</p>
    <p class="wl-text-small" role="status">{{ message }} Сохранений: {{ saved }}.</p>
  </div>
</template>
