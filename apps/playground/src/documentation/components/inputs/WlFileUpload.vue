<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlFileUpload, type WlFileReject } from "../../../../../../packages/ui-kit/src";
const documents = ref<File[]>([]);
const image = ref<File[]>([]);
const revision = ref(0);
const lastRejection = ref("");
const reasons: Record<WlFileReject["reason"], string> = { type: t("examples.unsupported_type_0728"), size: t("examples.size_limit_exceeded_0729"), count: t("examples.file_count_exceeded_0730") };
function reject(payload: WlFileReject) { lastRejection.value = `${payload.file.name}: ${reasons[payload.reason]}.`; }
function clear() { documents.value = []; image.value = []; lastRejection.value = ""; revision.value++; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlFileUpload">
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-documents">
      <h4 id="docs-upload-documents" class="wl-text-title">{{ t("examples.documents_type_size_and_count_0731") }}</h4>
      <p class="wl-text-small">{{ t("examples.pdf_or_txt_up_to_two_files_each_no_larger_than_1_mib_new_files_0732") }}</p>
      <WlFileUpload :key="`documents-${revision}`" v-model="documents" accept=".pdf,.txt" :max-files="2" :max-size="1048576" @reject="reject" />
      <p v-if="lastRejection" class="wl-text-small docs-upload-message">{{ t("examples.last_reject_event_0733") }} {{ lastRejection }}</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-upload-image">
      <h4 id="docs-upload-image" class="wl-text-title">{{ t("examples.one_file_replaces_the_previous_file_0734") }}</h4>
      <p class="wl-text-small">{{ t("examples.an_image_up_to_512_kib_with_multiple_false_the_next_valid_sele_0735") }}</p>
      <WlFileUpload :key="`image-${revision}`" v-model="image" accept="image/*" :multiple="false" :max-size="524288" @reject="reject" />
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.disabled_dropzone_and_clearing_0736") }}</h4>
      <WlFileUpload :model-value="[]" disabled />
      <WlButton size="sm" @click="clear">{{ t("examples.clear_lists_and_errors_0737") }}</WlButton>
      <p class="wl-text-small wl-text-muted">{{ t("examples.enter_space_on_the_dropzone_opens_the_file_picker_cancelling_p_0738") }}</p>
      <p class="wl-text-small" role="status">{{ t("examples.documents_0727") }} {{ documents.length }}{{ t("examples.images_0739") }} {{ image.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-upload-message { overflow-wrap: anywhere; }
</style>