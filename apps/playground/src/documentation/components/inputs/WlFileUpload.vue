<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlFileUpload, type WlFileReject } from "../../../../../../packages/ui-kit/src";
const documents = ref<File[]>([]);
const image = ref<File[]>([]);
const revision = ref(0);
const lastRejection = ref("");
const reasons: Record<WlFileReject["reason"], string> = { type: "неподдерживаемый тип", size: "превышен размер", count: "превышено число файлов" };
function reject(payload: WlFileReject) { lastRejection.value = `${payload.file.name}: ${reasons[payload.reason]}.`; }
function clear() { documents.value = []; image.value = []; lastRejection.value = ""; revision.value++; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlFileUpload">
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-documents">
      <h4 id="docs-upload-documents" class="wl-text-title">Документы: тип, размер и количество</h4>
      <p class="wl-text-small">PDF или TXT, не более двух файлов, каждый до 1 МиБ. Новые файлы дополняют список; кнопка рядом с файлом удаляет его.</p>
      <WlFileUpload :key="`documents-${revision}`" v-model="documents" accept=".pdf,.txt" :max-files="2" :max-size="1048576" @reject="reject" />
      <p v-if="lastRejection" class="wl-text-small docs-upload-message">Последнее событие reject: {{ lastRejection }}</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-image">
      <h4 id="docs-upload-image" class="wl-text-title">Один файл заменяет предыдущий</h4>
      <p class="wl-text-small">Изображение до 512 КиБ. При multiple=false следующий допустимый выбор заменяет текущий.</p>
      <WlFileUpload :key="`image-${revision}`" v-model="image" accept="image/*" :multiple="false" :max-size="524288" @reject="reject" />
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Недоступная дропзона и очистка</h4>
      <WlFileUpload :model-value="[]" disabled />
      <WlButton size="sm" @click="clear">Очистить списки и ошибки</WlButton>
      <p class="wl-text-small wl-text-muted">Enter/Space на дропзоне открывают выбор файлов. Отмена окна сохраняет список. Компонент принимает File[] локально; отправку на сервер выполняет приложение.</p>
      <p class="wl-text-small" role="status">Документов: {{ documents.length }}. Изображений: {{ image.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-upload-message { overflow-wrap: anywhere; }
</style>