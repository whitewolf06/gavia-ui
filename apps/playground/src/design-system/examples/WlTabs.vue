<script setup lang="ts">
import { ref } from "vue";
import { WlTabs } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref('example-overview');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTabs v-model="active" :items="[{ key: 'example-overview', label: 'Обзор' }, { key: 'example-history', label: 'История', count: 3 }]" v-bind="preview"><template #panel="{ item }"><p class="wl-text-body">{{ item.key === 'example-overview' ? 'Описание материала.' : 'Материал обновлён 1 октября.' }}</p></template></WlTabs>
  </div>
</template>
