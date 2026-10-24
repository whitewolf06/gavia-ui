<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, type WlFileReject, WlFileUpload } from "gavia-ui";
import { ref } from "vue";
const documents = ref<File[]>([]);
const image = ref<File[]>([]);
const revision = ref(0);
const lastRejection = ref("");
interface FileState { progress: number; status: "pending" | "uploading" | "success" | "error"; message?: string }
const states = ref(new Map<File, FileState>());
function fileState(file: File): FileState {
  return states.value.get(file) ?? { progress: 0, status: "pending" };
}
function advance(): void {
  for (const file of image.value) {
    const previous = fileState(file);
    if (previous.status === "error") continue;
    const progress = Math.min(100, previous.progress + 25);
    states.value.set(file, { progress, status: progress === 100 ? "success" : "uploading" });
  }
}
function fail(): void {
  const file = image.value[0];
  if (file) states.value.set(file, { ...fileState(file), status: "error", message: t("examples.reviewUploadError") });
}
function retry(file: File): void {
  states.value.set(file, { progress: 0, status: "pending" });
}
const reasons: Record<WlFileReject["reason"], string> = { type: t("examples.unsupported_type_0728"), size: t("examples.size_limit_exceeded_0729"), count: t("examples.file_count_exceeded_0730") };
function reject(payload: WlFileReject) {
  lastRejection.value = `${payload.file.name}: ${reasons[payload.reason]}.`;
}
function clear() {
  documents.value = [];
  image.value = [];
  states.value.clear();
  lastRejection.value = "";
  revision.value++;
}
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlFileUpload">
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-documents">
      <h3 id="docs-upload-documents" class="wl-text-title">{{ t("examples.documents_type_size_and_count_0731") }}</h3>
      <p class="wl-text-small">{{ t("examples.pdf_or_txt_up_to_two_files_each_no_larger_than_1_mib_new_files_0732") }}</p>
      <WlFileUpload
        :key="`documents-${revision}`"
        v-model="documents"
        accept=".pdf,.txt"
        :max-files="2"
        :max-size="1048576"
        @reject="reject"
      />
      <p v-if="lastRejection" class="wl-text-small docs-upload-message">{{ t("examples.last_reject_event_0733") }} {{ lastRejection }}</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-image">
      <h3 id="docs-upload-image" class="wl-text-title">{{ t("examples.one_file_replaces_the_previous_file_0734") }}</h3>
      <p class="wl-text-small">{{ t("examples.an_image_up_to_512_kib_with_multiple_false_the_next_valid_sele_0735") }}</p>
      <WlFileUpload
        :key="`image-${revision}`"
        v-model="image"
        accept="image/*"
        :multiple="false"
        :max-size="524288"
        preview
        :file-state="fileState"
        @reject="reject"
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
        <WlButton size="sm" :disabled="!image.length" @click="advance">{{ t("examples.reviewUploadAdvance") }}</WlButton>
        <WlButton
          size="sm"
          :disabled="!image.length"
          variant="ghost"
          @click="fail"
        >{{ t("examples.show_error_0618") }}</WlButton>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.disabled_dropzone_and_clearing_0736") }}</h3>
      <WlFileUpload :model-value="[]" disabled />
      <WlButton size="sm" @click="clear">{{ t("examples.clear_lists_and_errors_0737") }}</WlButton>
      <p class="wl-text-small wl-text-muted">{{ t("examples.enter_space_on_the_dropzone_opens_the_file_picker_cancelling_p_0738") }}</p>
      <p class="wl-text-small" role="status">{{ t("examples.documents_0727") }} {{
        documents.length
      }}{{ t("examples.images_0739") }} {{ image.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-upload-message { overflow-wrap: anywhere; }
</style>
