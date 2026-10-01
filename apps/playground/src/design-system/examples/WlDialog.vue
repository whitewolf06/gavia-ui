<script setup lang="ts">
import { ref } from "vue";
import { WlDialog, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">Открыть диалог</WlButton><WlDialog v-model:visible="visible" header="Сведения о материале" width="480px" v-bind="preview"><p class="wl-text-body">Escape закрывает окно и возвращает фокус.</p><template #footer><WlButton @click="visible = false">Готово</WlButton></template></WlDialog>
  </div>
</template>
