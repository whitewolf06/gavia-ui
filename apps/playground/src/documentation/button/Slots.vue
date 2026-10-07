<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlIcon } from "../../../../../packages/ui-kit/src";
const lastAction = ref("");
const unread = ref(3);
function readMessages(): void {
  unread.value = 0;
  lastAction.value = "Сообщения прочитаны";
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md">
      <WlButton variant="primary" @click="lastAction = 'Новая задача'">
        <template #icon><WlIcon name="plus" :size="16" /></template>
        Новая задача
      </WlButton>
      <WlButton @click="lastAction = 'Найти'">
        <template #icon><WlIcon name="search" :size="16" /></template>
        Найти
      </WlButton>
      <WlButton @click="lastAction = 'Продолжить'">
        <span class="button-slot-inline">Продолжить<WlIcon name="arrow-right" :size="16" /></span>
      </WlButton>
      <WlButton variant="danger-quiet" aria-label="Удалить черновик" @click="lastAction = 'Черновик удалён'">
        <template #icon><WlIcon name="trash" :size="16" /></template>
      </WlButton>
      <WlButton variant="soft" @click="readMessages">
        <span class="button-slot-inline">Сообщения<strong>{{ unread }}</strong></span>
      </WlButton>
    </div>
    <p class="wl-text-small wl-text-muted">icon размещает иконку слева. Default-слот допускает свою композицию: иконку справа или счётчик. Кнопка без текста получает aria-label.</p>
    <p class="wl-text-small" role="status">{{ lastAction ? 'Последнее действие: ' + lastAction : 'Нажмите на кнопку, чтобы проверить её действие и доступное имя.' }}</p>
  </div>
</template>

<style scoped>
.button-slot-inline { display: inline-flex; align-items: center; gap: var(--wl-space-sm); }
</style>
