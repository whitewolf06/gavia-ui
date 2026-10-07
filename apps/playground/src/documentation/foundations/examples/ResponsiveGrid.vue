<script setup lang="ts">
import { ref } from "vue";
import { WlButton } from "../../../../../../packages/ui-kit/src";
const projects = ["Исследование", "Проектирование", "Проверка"];
const selected = ref("");
</script>

<template>
  <section class="wl-stack" data-space="xl">
    <div class="responsive-example-grid wl-grid" data-space="lg">
      <article v-for="project in projects" :key="project" class="wl-surface wl-stack" data-space="md">
        <h3 class="wl-text-subheading">{{ project }}</h3>
        <p class="wl-text-body wl-text-muted">Карточки перестраиваются по доступной ширине, сохраняя порядок чтения.</p>
        <div><WlButton size="sm" :aria-label="'Выбрать ' + project" @click="selected = project">Выбрать</WlButton></div>
      </article>
    </div>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" @click="selected = 'Новый проект'">Добавить проект</WlButton>
      <WlButton @click="selected = ''">Сбросить выбор</WlButton>
    </div>
    <p class="wl-text-small wl-text-muted" role="status">{{ selected ? 'Выбрано: ' + selected : 'Выберите карточку. Действия переносятся на следующую строку.' }}</p>
  </section>
</template>

<style scoped>
/* The public primitive uses auto-fit; this application chooses explicit viewport tiers. */
.responsive-example-grid { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) { .responsive-example-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 900px) { .responsive-example-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
