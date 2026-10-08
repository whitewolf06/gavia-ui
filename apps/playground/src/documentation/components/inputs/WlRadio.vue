<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlRadio } from "../../../../../../packages/ui-kit/src";
const visibility = ref<string>("team");
const format = ref<string | null>(null);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlRadio">
    <fieldset class="docs-radio-group wl-stack" data-space="md">
      <legend class="wl-text-title">Одно значение для всей группы</legend>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="personal">Только мне</WlRadio>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="team">Команде</WlRadio>
      <WlRadio v-model="visibility" name="docs-input-visibility" value="public" disabled>Всем — временно недоступно</WlRadio>
      <p class="wl-text-small wl-text-muted">Общий name объединяет нативные radio. Стрелки меняют выбор внутри группы, Space выбирает сфокусированный пункт.</p>
    </fieldset>
    <fieldset class="docs-radio-group wl-stack" data-space="md" :aria-describedby="format == null ? 'docs-radio-error' : undefined">
      <legend class="wl-text-title">Обязательный выбор и invalid</legend>
      <WlRadio v-model="format" name="docs-input-format" value="pdf" :invalid="format == null" :aria-describedby="format == null ? 'docs-radio-error' : undefined" required>PDF-документ</WlRadio>
      <WlRadio v-model="format" name="docs-input-format" value="text" :invalid="format == null" :aria-describedby="format == null ? 'docs-radio-error' : undefined" required>Текстовый файл</WlRadio>
      <p v-if="format == null" id="docs-radio-error" class="wl-text-small" role="alert">Выберите формат экспорта.</p>
    </fieldset>
    <WlButton size="sm" @click="visibility = 'team'; format = null">Сбросить группы</WlButton>
    <p class="wl-text-small" role="status">Доступ: {{ visibility }}. Формат: {{ format ?? 'не выбран' }}.</p>
  </div>
</template>

<style scoped>
.docs-radio-group { min-width: 0; margin: 0; padding: 0; border: 0; }
.docs-radio-group legend { margin-bottom: var(--wl-space-md); }
</style>