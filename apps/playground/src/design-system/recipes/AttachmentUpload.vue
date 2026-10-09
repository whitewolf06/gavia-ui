<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
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
  <section class="wl-stack" data-space="lg" :aria-label="t('examples.uploading_attachments_0148')">
    <WlPageHeader :title="t('examples.material_attachments_0149')" :description="t('examples.pdf_and_txt_up_to_three_files_of_1_mb_each_0150')" :heading-level="2" size="md" />
    <WlFileUpload v-model="files" accept=".pdf,.txt" :max-files="3" :max-size="1048576" :disabled="busy" />
    <p class="wl-text-small wl-text-muted" role="status">{{ t("examples.files_0151") }} {{ files.length }} {{ t("examples.size_0152") }} {{ bytes }} {{ t("examples.bytes_0153") }}</p>
    <WlSwitch v-model="failure" :disabled="busy" :aria-label="t('examples.simulate_upload_failure_0154')">{{ t("examples.simulate_upload_failure_0154") }}</WlSwitch>
    <WlProgress v-if="busy || progress" :value="progress" show-value :aria-label="t('examples.uploading_attachments_0148')" />
    <WlAlert v-if="outcome === 'error'" variant="err" :title="t('examples.upload_incomplete_0155')">{{ t("examples.the_files_remain_in_the_list_0156") }}<template #action><WlButton size="sm" @click="retry">{{ t("examples.retry_upload_0157") }}</WlButton></template></WlAlert>
    <WlAlert v-if="outcome === 'success'" variant="ok" :title="t('examples.attachments_ready_0158')">{{ files.length }} {{ t("examples.files_processed_0159") }}</WlAlert>
    <div class="wl-inline" data-space="sm"><WlButton variant="primary" :loading="busy" :disabled="!files.length || outcome === 'success'" @click="upload">{{ t("examples.upload_attachments_0160") }}</WlButton><WlButton v-if="busy" variant="ghost" @click="cancel">{{ t("examples.cancel_upload_0161") }}</WlButton></div>
  </section>
</template>
