<script setup lang="ts">
import { ref } from "vue";
import { WlCard, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const saved = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCard v-bind="preview"><template #title>Руководство команды</template><template #subtitle>Обновлено 1 октября</template><p class="wl-text-body">Структура, роли и договорённости команды.</p><template #footer><WlButton size="sm" @click="saved = !saved">{{ saved ? 'В сохранённых' : 'Сохранить' }}</WlButton></template></WlCard>
  </div>
</template>
