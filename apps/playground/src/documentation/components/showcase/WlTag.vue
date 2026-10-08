<script setup lang="ts">
import { nextTick, ref } from "vue";
import { WlTag, WlButton, type WlTagVariant } from "../../../../../../packages/ui-kit/src";
const labels = { gray: "Обычный", blue: "Релиз", green: "Готово", amber: "В работе", red: "Просрочено" } satisfies Record<WlTagVariant, string>;
const tags = ref(["Дизайн", "Разработка", "Проверка"]);
const controls = ref<HTMLElement | null>(null);
async function remove(tag: string): Promise<void> { tags.value = tags.value.filter(value => value !== tag); await nextTick(); controls.value?.querySelector<HTMLButtonElement>("button")?.focus(); }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlTag v-for="(label, variant) in labels" :key="variant" :variant="variant">{{ label }}</WlTag></div>
    <div ref="controls" class="wl-inline" data-space="sm"><WlTag v-for="tag in tags" :key="tag" variant="blue" removable :remove-label="'Убрать тег ' + tag" @remove="remove(tag)">{{ tag }}</WlTag><WlButton size="sm" variant="ghost" @click="tags = ['Дизайн', 'Разработка', 'Проверка']">Восстановить теги</WlButton></div>
    <p class="wl-text-small" role="status">Выбранные теги: {{ tags.join(', ') || 'нет' }}.</p>
    <p class="wl-text-small wl-text-muted">Событие remove сообщает, какой тег нужно убрать. Приложение обновляет массив и восстанавливает фокус.</p>
  </div>
</template>
