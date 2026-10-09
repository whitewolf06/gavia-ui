<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlAccordion } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const open = ref<string[]>(['overview']);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAccordion v-model:open-keys="open" :items="[{ key: 'overview', title: t('examples.overview_0000'), content: t('examples.general_guidelines_0001') }, { key: 'details', title: t('examples.details_0002'), content: t('examples.agreements_and_examples_0003') }, { key: 'locked', title: t('examples.unavailable_section_0004'), disabled: true }]" v-bind="preview" />
  </div>
</template>
