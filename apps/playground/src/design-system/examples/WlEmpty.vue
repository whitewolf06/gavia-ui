<script setup lang="ts">
import { ref } from "vue";
import { WlEmpty, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const added = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlEmpty v-if="!added" icon="file" title="Материалов пока нет" description="Создайте первый материал." v-bind="preview"><template #action><WlButton @click="added = true">Добавить материал</WlButton></template></WlEmpty><p v-else role="status">Материал добавлен.</p>
  </div>
</template>
