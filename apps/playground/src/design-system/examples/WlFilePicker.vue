<script setup lang="ts">
import { ref } from "vue";
import { WlFilePicker, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const files = ref<File[]>([]);
const message = ref("Выберите файлы. Отправку на сервер нужно подключить в приложении.");
function select(next: File[]): void {
  files.value = next;
  message.value = `Выбрано: ${next.map((file) => file.name).join(', ')}`;
}
function reset(): void { files.value = []; message.value = "Можно выбрать файлы повторно."; }
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlFilePicker multiple accept=".pdf,.txt" v-bind="preview" @select="select" @cancel="message = 'Выбор отменён. Список файлов не изменился.'" />
    <p class="wl-text-small" role="status">{{ message }}</p>
    <WlButton v-if="files.length" size="sm" @click="reset">Очистить список</WlButton>
  </div>
</template>
