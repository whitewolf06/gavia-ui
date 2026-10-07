<script setup lang="ts">
import { computed, ref } from "vue";
import { WlFilterBar, WlInput, WlSelect, WlTag, WlButton } from "../../../../../../packages/ui-kit/src";
const search = ref("");
const status = ref<string | null>(null);
const open = ref(false);
const applied = ref(0);
const statuses = [{ label: "Готово", value: "done" }, { label: "В работе", value: "progress" }];
const count = computed(() => Number(Boolean(search.value)) + Number(Boolean(status.value)));
function clear(): void { search.value = ""; status.value = null; }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlFilterBar class="showcase-filters" v-model:open="open" :active-count="count" aria-label="Фильтры списка материалов" toggle-label="Настроить фильтры" panel-title="Фильтры материалов" @clear="clear" @apply="applied++">
      <template #leading><WlInput v-model="search" type="search" aria-label="Поиск в списке материалов" placeholder="Название материала" /></template>
      <WlSelect v-model="status" :options="statuses" option-label="label" option-value="value" aria-label="Статус списка материалов" placeholder="Все статусы" />
      <template #actions="{ clear: clearValues }"><WlButton size="sm" variant="ghost" :disabled="count === 0" @click="clearValues">Сбросить фильтры списка</WlButton><WlButton size="sm" @click="applied++">Применить на desktop</WlButton></template>
      <template #summary><div class="wl-inline" data-space="sm"><WlTag v-if="search" removable :remove-label="'Убрать поиск ' + search" @remove="search = ''">Поиск: {{ search }}</WlTag><WlTag v-if="status" variant="blue" removable remove-label="Убрать фильтр статуса" @remove="status = null">{{ statuses.find(item => item.value === status)?.label }}</WlTag><span v-if="!count" class="wl-text-small wl-text-muted">Активных фильтров нет</span></div></template>
    </WlFilterBar>
    <p class="wl-text-small" role="status">Активных фильтров: {{ count }}. Применений: {{ applied }}. На узком экране настройки открываются в drawer.</p>
  </div>
</template>
<style scoped>
@media (min-width: 721px) { .showcase-filters :deep(.wl-filter-bar__toolbar) { flex-wrap: wrap; } }
</style>
