<script setup lang="ts">
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlButton, WlTag } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const changed = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPageHeader title="Материалы команды" description="Рабочие договорённости и документация." :heading-level="2" v-bind="preview"><template #breadcrumbs><WlBreadcrumbs :items="[{ label: 'Команда', href: '#ds-components' }, { label: 'Материалы' }]" /></template><template #meta><WlTag>12 материалов</WlTag></template><template #actions><WlButton @click="changed = true">Добавить</WlButton></template></WlPageHeader><p v-if="changed" role="status">Материал добавлен.</p>
  </div>
</template>
