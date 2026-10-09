<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlFilePicker, WlIcon, type WlFilePickerExpose } from "../../../../../../packages/ui-kit/src";
const picker = ref<WlFilePickerExpose | null>(null);
const files = ref<File[]>([]);
const singleFiles = ref<File[]>([]);
const message = ref(t("examples.no_files_chosen_yet_0711"));
function selectFiles(batch: File[]) { files.value = batch; message.value = `${t("examples.files_selected_0712")}${batch.length}.`; }
function cancelSelection() { message.value = t("examples.selection_cancelled_the_previous_file_list_is_preserved_0713"); }
function clear() { picker.value?.clear(); files.value = []; singleFiles.value = []; message.value = t("examples.the_file_list_and_native_input_are_cleared_0714"); }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlFilePicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.custom_button_select_and_cancel_0715") }}</h4>
      <WlFilePicker ref="picker" multiple accept=".pdf,.txt" @select="selectFiles" @cancel="cancelSelection">
        <template #trigger="{ choose, disabled, attrs }"><WlButton v-bind="attrs" variant="primary" :disabled="disabled" @click="choose"><template #icon><WlIcon name="upload" :size="18" /></template>{{ t("examples.choose_documents_0716") }}</WlButton></template>
      </WlFilePicker>
      <ul v-if="files.length" class="wl-stack docs-file-list" data-space="sm"><li v-for="(file, index) in files" :key="`${file.name}:${index}`">{{ file.name }} — {{ file.size }} {{ t("examples.bytes_0153") }}</li></ul>
      <p v-else class="wl-text-small">{{ t("examples.no_documents_chosen_0717") }}</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="picker?.choose()">{{ t("examples.open_through_ref_0718") }}</WlButton><WlButton size="sm" @click="clear">{{ t("examples.clear_files_0719") }}</WlButton></div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.select_returns_a_new_file_list_it_replaces_the_application_lis_0720") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.default_button_sizes_and_disabled_0721") }}</h4>
      <div class="wl-inline" data-space="md"><WlFilePicker v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :size="size" accept=".txt" :choose-label="`${t('examples.one_txt_0722')}${size}`" @select="singleFiles = $event" /><WlFilePicker size="sm" density="compact" :choose-label="t('examples.compact_selection_0723')" accept=".txt" @select="singleFiles = $event" /><WlFilePicker :choose-label="t('examples.unavailable_selection_0724')" disabled /></div>
      <p class="wl-text-small">{{ t("examples.last_single_selection_0725") }} {{ singleFiles[0]?.name ?? t("examples.none_0306") }}.</p>
      <p class="wl-text-small wl-text-muted">{{ t("examples.accept_is_a_browser_hint_the_application_validates_type_size_a_0726") }}</p>
      <p class="wl-text-small" role="status">{{ message }} {{ t("examples.documents_0727") }} {{ files.length }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-file-list { margin: 0; padding-inline-start: var(--wl-space-lg); overflow-wrap: anywhere; }
</style>