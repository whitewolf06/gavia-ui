<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { WlPageHeader, WlFileUpload, WlButton, WlProgress, WlAlert, WlSwitch } from "../../../../../packages/ui-kit/src";
const files = ref<File[]>([]);
const busy = ref(false);
const progress = ref(0);
const failure = ref(false);
const outcome = ref<"idle" | "success" | "error">("idle");
const bytes = computed(() => files.value.reduce((sum, file) => sum + file.size, 0));
watch(files, () => { progress.value = 0; outcome.value = "idle"; });
let timer: ReturnType<typeof setInterval> | undefined;
function stop(): void { if (timer !== undefined) clearInterval(timer); timer = undefined; busy.value = false; }
onBeforeUnmount(stop);
function upload(): void {
  if (busy.value || !files.value.length) return;
  busy.value = true; progress.value = 0; outcome.value = "idle";
  const shouldFail = failure.value;
  // Local progress demonstration; actual uploading belongs to the application.
  timer = setInterval(() => {
    progress.value += 25;
    if (progress.value >= 100) { stop(); outcome.value = shouldFail ? "error" : "success"; }
  }, 150);
}
function retry(): void { failure.value = false; upload(); }
function cancel(): void { stop(); progress.value = 0; outcome.value = "idle"; }
</script>

<template>
  <section class="wl-stack" data-space="lg" aria-label="Загрузка вложений">
    <WlPageHeader title="Вложения материала" description="PDF и TXT, до трёх файлов по 1 МБ." :heading-level="2" size="md" />
    <WlFileUpload v-model="files" accept=".pdf,.txt" :max-files="3" :max-size="1048576" :disabled="busy" />
    <p class="wl-text-small wl-text-muted" role="status">Файлов: {{ files.length }} · объём: {{ bytes }} байт</p>
    <WlSwitch v-model="failure" :disabled="busy" aria-label="Проверить ошибку загрузки">Проверить ошибку загрузки</WlSwitch>
    <WlProgress v-if="busy || progress" :value="progress" show-value aria-label="Загрузка вложений" />
    <WlAlert v-if="outcome === 'error'" variant="err" title="Загрузка не завершена">Файлы остались в списке.<template #action><WlButton size="sm" @click="retry">Повторить загрузку</WlButton></template></WlAlert>
    <WlAlert v-if="outcome === 'success'" variant="ok" title="Вложения готовы">{{ files.length }} файлов обработано.</WlAlert>
    <div class="wl-inline" data-space="sm"><WlButton variant="primary" :loading="busy" :disabled="!files.length || outcome === 'success'" @click="upload">Загрузить вложения</WlButton><WlButton v-if="busy" variant="ghost" @click="cancel">Отменить загрузку</WlButton></div>
  </section>
</template>
