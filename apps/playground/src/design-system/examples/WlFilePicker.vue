<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlFilePicker, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const files = ref<File[]>([]);
const message = ref(t("examples.choose_files_connect_server_upload_in_your_application_0058"));
function select(next: File[]): void {
  files.value = next;
  message.value = `${t("examples.selected_0059")}${next.map((file) => file.name).join(', ')}`;
}
function reset(): void { files.value = []; message.value = t("examples.you_can_choose_files_again_0060"); }
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlFilePicker multiple accept=".pdf,.txt" v-bind="preview" @select="select" @cancel="message = t('examples.selection_cancelled_the_file_list_has_not_changed_0061')" />
    <p class="wl-text-small" role="status">{{ message }}</p>
    <WlButton v-if="files.length" size="sm" @click="reset">{{ t("examples.clear_list_0062") }}</WlButton>
  </div>
</template>
