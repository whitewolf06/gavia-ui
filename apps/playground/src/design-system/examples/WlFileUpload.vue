<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlFileUpload } from "gavia-ui";
import { ref } from "vue";
const files = ref<File[]>([]);
interface FileState { progress: number; status: "pending" | "uploading" | "success" | "error"; message?: string }
const states = ref(new Map<File, FileState>());
function fileState(file: File): FileState {
  return states.value.get(file) ?? { progress: 0, status: "pending" };
}
function advance(): void {
  for (const file of files.value) {
    const previous = fileState(file);
    if (previous.status === "error") continue;
    const progress = Math.min(100, previous.progress + 25);
    states.value.set(file, { progress, status: progress === 100 ? "success" : "uploading" });
  }
}
function fail(): void {
  const file = files.value[0];
  if (file) states.value.set(file, { ...fileState(file), status: "error", message: t("examples.reviewUploadError") });
}
function retry(file: File): void {
  states.value.set(file, { progress: 0, status: "pending" });
}
function clear(): void {
  files.value = [];
  states.value.clear();
}
</script>

<template>
  <div class="wl-stack" data-space="md">
    <p class="wl-text-small">{{ t("examples.reviewUploadLocal") }}</p>
    <WlFileUpload
      v-model="files"
      accept="image/*,.pdf,.txt"
      :max-files="3"
      :max-size="1048576"
      preview
      :file-state="fileState"
      v-bind="preview"
    >
      <template #row="{ file, size, previewUrl, state, remove }">
        <img
          v-if="previewUrl"
          class="wl-upload__preview"
          :src="previewUrl"
          alt=""
        />
        <span class="wl-upload__name">{{ file.name }}</span>
        <span class="wl-upload__size">{{ size }}</span>
        <progress
          class="wl-upload__progress"
          :value="state?.progress ?? 0"
          max="100"
          :aria-label="t('examples.reviewUploadProgress') + ' ' + file.name"
        ></progress>
        <span v-if="state?.message" class="wl-upload__message">{{ state.message }}</span>
        <WlButton
          v-if="state?.status === 'error'"
          size="sm"
          variant="ghost"
          @click="retry(file)"
        >{{ t("examples.retry_0913") }}</WlButton>
        <WlButton
          size="sm"
          variant="ghost"
          :aria-label="t('examples.reviewUploadRemove') + ' ' + file.name"
          @click="remove"
        >{{ t("examples.delete_0037") }}</WlButton>
      </template>
    </WlFileUpload>
    <div class="wl-inline" data-space="sm">
      <WlButton size="sm" :disabled="!files.length" @click="advance">{{ t("examples.reviewUploadAdvance") }}</WlButton>
      <WlButton
        size="sm"
        :disabled="!files.length"
        variant="ghost"
        @click="fail"
      >{{ t("examples.show_error_0618") }}</WlButton>
      <WlButton size="sm" variant="ghost" @click="clear">{{ t("examples.clear_lists_and_errors_0737") }}</WlButton>
    </div>
    <p class="wl-text-small" role="status">{{ t("examples.files_selected_0063") }} {{ files.length }}</p>
  </div>
</template>
