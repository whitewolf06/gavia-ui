<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPagination } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const page = ref(1);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPagination v-model:page="page" :page-count="12" v-bind="preview" /><p class="wl-text-small" role="status">{{ t("examples.page_0088") }} {{ page }} {{ t("examples.of_12_0089") }}</p>
  </div>
</template>
