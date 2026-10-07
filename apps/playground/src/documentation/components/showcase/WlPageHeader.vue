<script setup lang="ts">
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlButton, WlCheckbox, WlPill, WlSegmented, type WlSizeSm } from "../../../../../../packages/ui-kit/src";
const size = ref<WlSizeSm>("lg");
const compact = ref(false);
const view = ref<string | null>("list");
const added = ref(0);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton v-for="value in (['sm', 'md', 'lg'] as const)" :key="value" size="sm" :aria-pressed="size === value" @click="size = value">{{ value }}</WlButton><WlCheckbox v-model="compact">Компактный заголовок</WlCheckbox></div>
    <WlPageHeader :heading-level="2" :size="size" :density="compact ? 'compact' : 'default'">
      <template #breadcrumbs><WlBreadcrumbs :items="[{ label: 'Gavia UI', href: '?' }, { label: 'Документация', href: '?view=docs' }, { label: 'Материалы' }]" /></template>
      <template #eyebrow>Рабочее пространство</template><template #title>Материалы команды</template><template #description>Действия и метаданные перестраиваются по доступной ширине.</template>
      <template #meta><WlPill variant="info" label="24 активных" /><span>Обновлено сегодня</span></template>
      <template #actions><WlButton size="sm" variant="primary" @click="added++">Новый материал</WlButton><WlButton size="sm" disabled>Экспорт недоступен</WlButton></template>
      <template #navigation><WlSegmented v-model="view" :options="[{ label: 'Список', value: 'list', icon: 'list' }, { label: 'Сетка', value: 'grid', icon: 'grid' }]" aria-label="Вид списка материалов" /></template>
    </WlPageHeader>
    <p class="wl-text-small" role="status">Вид: {{ view === 'list' ? 'Список' : 'Сетка' }}. Новых материалов в примере: {{ added }}.</p>
  </div>
</template>
