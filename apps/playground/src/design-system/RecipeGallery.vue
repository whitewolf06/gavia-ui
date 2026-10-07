<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type Component } from "vue";
import { WlButton } from "../../../../packages/ui-kit/src";
import CodePanel from "./CodePanel.vue";
import { consumerSource } from "./code";
const recipes = [
  { id: "MaterialList", label: "Список и CRUD", description: "Поиск, статус, сортировка, страницы, создание и редактирование в Drawer, подтверждение удаления и Toast." },
  { id: "ProfileForm", label: "Форма", description: "Связь label/error с полем, первая ошибка получает фокус, загрузка, ошибка запроса и повторное сохранение без потери ввода." },
  { id: "Preferences", label: "Настройки", description: "Черновик, зависимые поля, несохранённые изменения, отмена и сохранение предпочтений." },
  { id: "MaterialDetail", label: "Деталь", description: "Заголовок, хлебные крошки, автор, статус, вкладки, редактирование в Dialog с отменой и возвратом фокуса." },
  { id: "ProjectWizard", label: "Пошаговая форма", description: "Валидация шага, переходы вперёд и назад, сохранение ввода, обзор и завершение." },
  { id: "AttachmentUpload", label: "Вложения", description: "Ограничение типов, размера и количества, прогресс, отмена, ошибка и повторная загрузка." }
] as const;
const modules = import.meta.glob<{ default: Component }>("./recipes/*.vue");
const sources = import.meta.glob<string>("./recipes/*.vue", { eager: true, query: "?raw", import: "default" });
const components = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path, defineAsyncComponent(loader)]));
const selected = ref<string>("MaterialList");
const revision = ref(0);
const recipe = computed(() => recipes.find((item) => item.id === selected.value)!);
const source = computed(() => consumerSource(sources[`./recipes/${selected.value}.vue`] ?? ""));
const component = computed(() => components[`./recipes/${selected.value}.vue`]);
function select(id: string): void { selected.value = id; revision.value++; }
const setupSource = `// main.ts — CSS подключается явно; тему задаёт data-wl-theme на html.
import { createApp } from "vue";
import { WlConfig, WlToastService, WlConfirmationService, createWlPt, wlLocaleRu } from "gavia-ui";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import App from "./App.vue";

document.documentElement.dataset.wlTheme = "white";

// WlConfig merges application pt with defaults; local component pt is applied last.
const pt = createWlPt({ button: { root: { "data-ui": "action" } } });
createApp(App).use(WlConfig, { locale: wlLocaleRu, motion: true, pt })
  .use(WlToastService).use(WlConfirmationService).mount("#app");

// App.vue: импортируйте WlToast/WlConfirmDialog и смонтируйте по одному
// контейнеру рядом со страницей. Уведомления и подтверждения используют их.
// <template><YourPage /><WlToast /><WlConfirmDialog /></template>`;
</script>

<template>
  <div class="wl-stack" data-space="lg" data-testid="ds-recipes">
    <div class="wl-inline" data-space="sm" role="group" aria-label="Готовые сценарии"><WlButton v-for="item in recipes" :key="item.id" :variant="selected === item.id ? 'primary' : 'secondary'" :aria-pressed="selected === item.id" :data-recipe="item.id" @click="select(item.id)">{{ item.label }}</WlButton></div>
    <p class="wl-text-body wl-text-muted">{{ recipe.description }}</p>
    <div class="ds-recipe-preview wl-surface" data-testid="ds-recipe-preview" :data-recipe="recipe.id"><component :is="component" :key="`${selected}-${revision}`" /></div>
    <div><WlButton size="sm" variant="ghost" @click="revision++">Начать сценарий заново</WlButton></div>
    <CodePanel :source="source" />
    <p class="wl-text-small wl-text-muted">Данные демонстрационные, запросы формы и загрузки моделируются локально. При переносе подключите запросы своего приложения. Код примера и работающий сценарий берутся из одного Vue-файла.</p>
    <CodePanel :source="setupSource" title="Подключение стилей, темы и сервисов" />
  </div>
</template>

<style>
.ds-recipe-preview { min-width: 0; overflow-wrap: anywhere; }
</style>
