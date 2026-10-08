<script setup lang="ts">
import { ref } from "vue";
import { WlDrawer, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">Открыть панель</WlButton><WlDrawer v-model:visible="visible" header="О материале" v-bind="preview"><p class="wl-text-body">Сведения о материале открываются поверх страницы.</p><template #footer><WlButton @click="visible = false">Готово</WlButton></template></WlDrawer>
  </div>
</template>
