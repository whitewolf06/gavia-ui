<script setup lang="ts">
import { computed, ref } from "vue";
import { WlChip, WlButton } from "../../../../../../packages/ui-kit/src";
const design = ref(true);
const development = ref(false);
const review = ref(false);
const selected = computed(() => [[design.value, "Дизайн"], [development.value, "Разработка"], [review.value, "Проверка"]].filter(([active]) => active).map(([, label]) => label).join(", "));
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlChip v-model:active="design" :count="7">Дизайн</WlChip><WlChip v-model:active="development" :count="23">Разработка</WlChip><WlChip v-model:active="review" :count="0">Проверка</WlChip><WlChip disabled>Архив</WlChip></div>
    <div><WlButton size="sm" variant="ghost" @click="design = false; development = false; review = false">Снять все фильтры</WlButton></div>
    <p class="wl-text-small" role="status">Фильтры: {{ selected || 'не выбраны' }}.</p>
  </div>
</template>
