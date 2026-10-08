<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlFilePicker, WlIcon, type WlFilePickerExpose } from "../../../../../../packages/ui-kit/src";
const picker = ref<WlFilePickerExpose | null>(null);
const files = ref<File[]>([]);
const singleFiles = ref<File[]>([]);
const message = ref("Файлы ещё не выбирали.");
function selectFiles(batch: File[]) { files.value = batch; message.value = `Получена новая партия: ${batch.length}.`; }
function cancelSelection() { message.value = "Выбор отменён; предыдущая партия сохранена."; }
function clear() { picker.value?.clear(); files.value = []; singleFiles.value = []; message.value = "Список приложения и нативный выбор очищены."; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlFilePicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Своя кнопка, select и cancel</h4>
      <WlFilePicker ref="picker" multiple accept=".pdf,.txt" @select="selectFiles" @cancel="cancelSelection">
        <template #trigger="{ choose, disabled, attrs }"><WlButton v-bind="attrs" variant="primary" :disabled="disabled" @click="choose"><template #icon><WlIcon name="upload" :size="18" /></template>Выбрать документы</WlButton></template>
      </WlFilePicker>
      <ul v-if="files.length" class="wl-stack docs-file-list" data-space="sm"><li v-for="(file, index) in files" :key="`${file.name}:${index}`">{{ file.name }} — {{ file.size }} байт</li></ul>
      <p v-else class="wl-text-small">Партия документов пуста.</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="picker?.choose()">Открыть через ref</WlButton><WlButton size="sm" @click="clear">Очистить файлы</WlButton></div>
      <p class="wl-text-small wl-text-muted">select возвращает новую партию File[]. Здесь она заменяет список приложения. Отмена сохраняет его; clear() очищает нативное поле, поэтому список сбрасывается отдельно.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Стандартная кнопка: размеры и disabled</h4>
      <div class="wl-inline" data-space="md"><WlFilePicker v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :size="size" accept=".txt" :choose-label="`Один TXT, ${size}`" @select="singleFiles = $event" /><WlFilePicker size="sm" density="compact" choose-label="Компактный выбор" accept=".txt" @select="singleFiles = $event" /><WlFilePicker choose-label="Недоступный выбор" disabled /></div>
      <p class="wl-text-small">Последний одиночный выбор: {{ singleFiles[0]?.name ?? 'нет' }}.</p>
      <p class="wl-text-small wl-text-muted">accept — подсказка браузеру. Проверку типа, размера и содержимого выполняет приложение. Этот компонент не отправляет файлы в сеть.</p>
      <p class="wl-text-small" role="status">{{ message }} Документов: {{ files.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-file-list { margin: 0; padding-inline-start: var(--wl-space-lg); overflow-wrap: anywhere; }
</style>