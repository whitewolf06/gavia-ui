<script setup lang="ts">
import { ref } from "vue";
import { WlTable, WlButton, WlPill, type WlTableColumn, type WlTableRow } from "../../../../../../packages/ui-kit/src";
const state = ref<"ready" | "empty" | "loading">("ready");
const selected = ref("");
const columns: WlTableColumn[] = [{ key: "title", label: "Материал" }, { key: "status", label: "Статус" }, { key: "hours", label: "Часы", numeric: true }];
const rows: WlTableRow[] = [{ title: "План выпуска", status: "done", hours: 8 }, { title: "Обзор", status: "progress", hours: 3 }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm" role="group" aria-label="Состояние таблицы"><WlButton v-for="item in (['ready', 'empty', 'loading'] as const)" :key="item" size="sm" :aria-pressed="state === item" @click="state = item">{{ { ready: 'Данные', empty: 'Пусто', loading: 'Загрузка' }[item] }}</WlButton></div>
    <div class="showcase-table-scroll" tabindex="0" role="region" aria-label="Таблица материалов — горизонтальная прокрутка">
      <WlTable :value="state === 'empty' ? [] : rows" :columns="columns" :loading="state === 'loading'" :pt="{ table: { 'aria-label': 'Материалы команды' } }">
        <template #cell-title="{ value }"><WlButton size="sm" variant="link" :disabled="state === 'loading'" @click="selected = String(value)">{{ value }}</WlButton></template>
        <template #cell-status="{ value }"><WlPill :variant="value === 'done' ? 'ok' : 'info'" :label="value === 'done' ? 'Готово' : 'В работе'" /></template>
        <template #empty><div class="wl-stack" data-space="sm"><span>Материалов пока нет.</span><div><WlButton size="sm" @click="state = 'ready'">Восстановить список</WlButton></div></div></template>
      </WlTable>
    </div>
    <p class="wl-text-small" role="status">{{ selected ? 'Выбран материал: ' + selected : 'Нажмите название материала. Часы выровнены как numeric.' }}</p>
    <WlTable><table class="showcase-custom-table"><caption>Default-слот: собственная таблица</caption><thead><tr><th scope="col">Раздел</th><th scope="col">Записей</th></tr></thead><tbody><tr><th scope="row">Документы</th><td>2</td></tr></tbody></table></WlTable>
  </div>
</template>
<style scoped>
.showcase-table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); }
.showcase-table-scroll :deep(table) { min-width: 360px; }
.showcase-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.showcase-custom-table { width: 100%; border-collapse: collapse; text-align: left; }
.showcase-custom-table th, .showcase-custom-table td { padding: var(--wl-space-sm); border-bottom: 1px solid var(--wl-border); }
.showcase-custom-table caption { text-align: left; padding-bottom: var(--wl-space-sm); }
</style>
