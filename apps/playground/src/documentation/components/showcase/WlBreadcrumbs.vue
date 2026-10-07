<script setup lang="ts">
import { ref } from "vue";
import { WlBreadcrumbs, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const short = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="short">Короткий путь</WlCheckbox>
    <WlBreadcrumbs :items="short ? [{ label: 'Gavia UI', href: '?', icon: 'home' }, { label: 'Материалы' }] : [{ label: 'Gavia UI', href: '?', icon: 'home' }, { label: 'Документация', href: '?view=docs' }, { label: 'Материалы' }]" :pt="{ root: { 'aria-label': 'Путь к материалам' } }" />
    <WlBreadcrumbs :items="[{ label: 'Текущая страница без родителей' }]" :pt="{ root: { 'aria-label': 'Одноуровневый путь' } }" />
    <p class="wl-text-small wl-text-muted">Родительские пункты — настоящие ссылки. Последний пункт получает aria-current="page" и не выполняет переход.</p>
  </div>
</template>
