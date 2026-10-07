<script setup lang="ts">
import { ref } from "vue";
import { WlEmpty, WlButton, WlIcon, WlTag } from "../../../../../../packages/ui-kit/src";
const created = ref(false);
const query = ref("архив");
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlEmpty v-if="!created" icon="file" title="Материалов пока нет" description="Добавьте первый материал, чтобы начать работу."><template #action><WlButton size="sm" variant="primary" @click="created = true">Добавить первый материал</WlButton></template></WlEmpty>
    <div v-else class="wl-inline" data-space="sm"><WlTag variant="green">Первый материал добавлен</WlTag><WlButton size="sm" variant="ghost" @click="created = false">Очистить локальный список</WlButton></div>
    <WlEmpty v-if="query" icon="search" title="Ничего не найдено" :description="'Нет результатов по запросу «' + query + '».'"><template #action><WlButton size="sm" @click="query = ''">Сбросить поисковый запрос</WlButton></template></WlEmpty><p v-else class="wl-text-body">Поиск сброшен: доступны все материалы.</p>
    <WlEmpty title="Выберите папку"><template #icon><WlIcon name="folder" :size="36" /></template><p>Default-слот позволяет добавить <a href="?view=docs">ссылку на документацию</a> и свою инструкцию.</p></WlEmpty>
  </div>
</template>
