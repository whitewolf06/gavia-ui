<script setup lang="ts">
import { ref } from "vue";
import { WlMenu, WlButton, type WlMenuItem, type WlMenuExpose } from "../../../../../../packages/ui-kit/src";
const popup = ref<WlMenuExpose | null>(null);
const message = ref("Команда ещё не выбрана.");
const items: WlMenuItem[] = [
  { header: "Материал" },
  { key: "edit", label: "Редактировать", icon: "edit", shortcut: "Ctrl+E", command: () => message.value = "Открыто редактирование." },
  { key: "copy", label: "Копировать ссылку", icon: "copy", command: () => message.value = "Локальный пример копирования." },
  { key: "export", label: "Экспорт", icon: "download", disabled: true },
  { separator: true },
  { key: "remove", label: "Удалить", icon: "trash", danger: true, command: () => message.value = "Выбрано удаление; подтверждение добавляет приложение." }
];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlMenu :items="items" aria-label="Статические команды материала" /></div>
    <div><WlButton @click="popup?.toggle($event)">Открыть popup-меню</WlButton><WlMenu ref="popup" popup :items="items" aria-label="Всплывающие команды материала" /></div>
    <p class="wl-text-small" role="status">{{ message }}</p>
    <p class="wl-text-small wl-text-muted">Стрелки ↑/↓, Home и End перемещают фокус. Escape закрывает popup. Shortcut показывает подпись сочетания; обработчик сочетания добавляет приложение.</p>
  </div>
</template>
