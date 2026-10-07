<script setup lang="ts">
import { ref } from "vue";
import { WlCommandPalette, WlButton, WlCheckbox, type WlCommandPaletteGroup } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const query = ref("");
const loading = ref(false);
const selected = ref("");
const groups: WlCommandPaletteGroup[] = [
  { id: "quick", label: "Быстрые действия", showWhenEmpty: true, items: [{ id: "new", label: "Новый материал", description: "Создать локальный черновик", icon: "plus" }, { id: "settings", label: "Настройки", icon: "settings" }] },
  { id: "materials", label: "Материалы", items: [{ id: "plan", label: "План выпуска", description: "Документ команды", keywords: ["план", "релиз"], icon: "file" }, { id: "report", label: "Отчёт", icon: "file", disabled: true }] }
];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="loading">Показать загрузку результатов</WlCheckbox>
    <div><WlButton @click="visible = true">Открыть поиск материалов</WlButton></div>
    <WlCommandPalette v-model:visible="visible" v-model:query="query" :groups="loading ? [] : groups" :loading="loading" aria-label="Поиск по материалам примера" @select="selected = $event.label"><template #group="{ group }"><strong>{{ group.label }}</strong></template><template #empty="{ query: text }"><div class="wl-stack" data-space="sm"><span>По запросу «{{ text }}» ничего нет.</span><div><WlButton size="sm" @click="query = ''">Очистить строку поиска</WlButton></div></div></template><template #footer><p class="wl-text-small wl-text-muted">↑/↓ — выбор · Enter — действие · Escape — закрыть</p></template></WlCommandPalette>
    <p class="wl-text-small" role="status">{{ selected ? 'Выбрано: ' + selected : 'Быстрые действия видны сразу; поиск открывает остальные группы.' }}</p>
    <p class="wl-text-small wl-text-muted">В этом примере shortcut выключен. Включайте Ctrl/Cmd+K только у одной палитры в приложении.</p>
  </div>
</template>
