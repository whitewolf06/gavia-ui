<script setup lang="ts">
import { ref } from "vue";
import { WlAlert, WlButton, WlEmpty, WlSegmented, WlSkeleton } from "../../../../../../packages/ui-kit/src";
const state = ref<string | null>("ready");
const options = [
  { label: "Готово", value: "ready" }, { label: "Загрузка", value: "loading" },
  { label: "Пусто", value: "empty" }, { label: "Ошибка", value: "error" }
];
const materials = ["План запуска", "Правила доступа", "Результаты проверки"];
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <WlSegmented v-model="state" :options="options" aria-label="Состояние примера контента" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" />
    <div v-if="state === 'loading'" class="wl-stack" data-space="md" role="status" aria-busy="true">
      <p class="wl-text-body">Загружаем материалы…</p><WlSkeleton height="20px" /><WlSkeleton height="20px" width="80%" /><WlSkeleton height="20px" width="60%" />
    </div>
    <WlEmpty v-else-if="state === 'empty'" icon="file" title="Материалов пока нет" description="Добавьте первый материал, чтобы начать работу.">
      <template #action><WlButton @click="state = 'ready'">Добавить пример</WlButton></template>
    </WlEmpty>
    <WlAlert v-else-if="state === 'error'" variant="err" title="Не удалось загрузить материалы">
      Повторите попытку. Ваши данные сохранены.
      <template #action><WlButton size="sm" @click="state = 'ready'">Повторить</WlButton></template>
    </WlAlert>
    <div v-else class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">Материалы проекта</h3><ul class="content-state-list wl-text-body"><li v-for="material in materials" :key="material">{{ material }}</li></ul>
      <p class="wl-text-small wl-text-muted" role="status">Доступно материалов: {{ materials.length }}</p>
    </div>
    <p class="wl-text-small wl-text-muted">Локальный пример: состояния переключаются без API-запросов.</p>
  </section>
</template>

<style scoped>
.content-state-list { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); }
</style>
