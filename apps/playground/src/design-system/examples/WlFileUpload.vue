<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlFileUpload } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const files = ref<File[]>([]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlFileUpload v-model="files" accept=".pdf,.txt" :max-files="3" :max-size="1048576" v-bind="preview" /><p class="wl-text-small" role="status">{{ t("examples.files_selected_0063") }} {{ files.length }}</p>
  </div>
</template>
