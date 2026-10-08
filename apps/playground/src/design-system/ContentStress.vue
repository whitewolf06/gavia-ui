<script setup lang="ts">
import { computed, ref } from "vue";
import { WlPageHeader, WlButton, WlTag, WlMultiSelect, WlField, WlInput, WlTable, WlDatePicker, WlDrawer, WlDialog } from "../../../../packages/ui-kit/src";
const long = ref(true);
const title = computed(() => long.value ? "Договорённости международной распределённой команды по совместной подготовке материалов и проведению исследований" : "Материалы команды");
const options = Array.from({ length: 80 }, (_, index) => ({ label: `Направление ${index + 1} · документация и исследования`, value: index }));
const selected = ref([0, 1, 2, 3, 4, 5, 6, 7]);
const date = ref<string | null>("2026-10-15");
const outer = ref(false);
const inner = ref(false);
const rows = computed(() => Array.from({ length: 20 }, (_, index) => ({ name: `${title.value} · ${index + 1}`, reference: "research_material_without_spaces_2026_10_01_abcdefghijklmnopqrstuvwxyz" })));
</script>

<template>
  <div class="ds-stress wl-stack" data-space="lg" data-testid="ds-stress">
    <div class="wl-inline" data-space="sm"><WlButton :aria-pressed="long" @click="long = !long">Длинные подписи</WlButton><WlButton @click="outer = true">Вложенные оверлеи</WlButton></div>
    <div class="wl-surface wl-stack" data-space="lg">
      <WlPageHeader :title="title" description="Сузьте окно, чтобы посмотреть перенос заголовка, кнопок и метаданных." :heading-level="2" size="md"><template #actions><WlButton class="ds-stress-action" variant="primary">Подготовить материалы</WlButton><WlButton class="ds-stress-action" variant="ghost">Дополнительные действия</WlButton></template></WlPageHeader>
      <div class="wl-inline" data-space="sm"><WlTag v-for="index in 8" :key="index">Исследование {{ index }}</WlTag></div>
      <WlMultiSelect v-model="selected" :options="options" option-label="label" option-value="value" :max-selected-labels="3" display="comma" filter aria-label="Направления исследований" />
      <WlField label="Длинное пояснение ошибки" id="ds-stress-invalid" error="Укажите понятное название материала, чтобы участники из разных команд могли найти его через поиск и отличить от похожих материалов." v-slot="field"><WlInput :id="field.id" :model-value="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" /></WlField>
      <WlField label="Дата в пределах октября" id="ds-stress-date" hint="1–31 октября 2026." v-slot="field"><WlDatePicker :id="field.id" v-model="date" :aria-describedby="field.ariaDescribedby" min-date="2026-10-01" max-date="2026-10-31" show-icon /></WlField>
      <div class="ds-stress-table" role="region" aria-label="Таблица длинных материалов" tabindex="0"><WlTable :columns="[{ key: 'name', label: 'Длинное название' }, { key: 'reference', label: 'Идентификатор' }]" :value="rows" /></div>
    </div>
    <WlDrawer v-model:visible="outer" header="Контекст материала">
      <div class="wl-stack" data-space="lg"><p class="wl-text-body">{{ title }}</p><WlButton @click="inner = true">Открыть вложенный диалог</WlButton><p v-for="index in 16" :key="index" class="wl-text-small wl-text-muted">Раздел {{ index }}: длинная панель прокручивается внутри.</p></div>
      <template #footer><WlButton @click="outer = false">Закрыть панель</WlButton></template>
    </WlDrawer>
    <WlDialog v-model:visible="inner" header="Вложенное действие"><p class="wl-text-body">Escape закрывает верхний слой. Фокус возвращается в панель.</p><template #footer><WlButton @click="inner = false">Закрыть диалог</WlButton></template></WlDialog>
  </div>
</template>

<style>
.ds-stress { overflow-wrap: anywhere; }
.ds-stress-table { overflow: auto; max-height: 300px; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.ds-stress-table .wl-table { min-width: 640px; }
.ds-stress-action { max-width: 100%; height: auto; min-height: var(--wl-control-height-md); padding-block: var(--wl-space-sm); white-space: normal; }
</style>
