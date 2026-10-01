<script setup lang="ts">
import { ref } from "vue";
import { WlFilterBar, WlInput, WlSelect, WlTag } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const search = ref('');
const status = ref<string | null>(null);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlFilterBar :active-count="Number(Boolean(search)) + Number(Boolean(status))" v-bind="preview" @clear="search = ''; status = null"><template #leading><WlInput v-model="search" type="search" aria-label="Поиск материалов" placeholder="Поиск" /></template><WlSelect v-model="status" :options="[{ label: 'Готово', value: 'done' }, { label: 'В работе', value: 'progress' }]" option-label="label" option-value="value" aria-label="Статус" placeholder="Все статусы" /><template #summary><WlTag v-if="status" removable @remove="status = null">{{ status }}</WlTag></template></WlFilterBar>
  </div>
</template>
