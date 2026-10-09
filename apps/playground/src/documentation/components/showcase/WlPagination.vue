<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPagination, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const page = ref(6);
const compactPage = ref(2);
const disabled = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="disabled">{{ t("examples.disable_page_navigation_0513") }}</WlCheckbox>
    <WlPagination v-model:page="page" :page-count="12" :siblings="1" :disabled="disabled" :pt="{ root: { 'aria-label': t('examples.material_pages_0514') } }" />
    <WlPagination v-model:page="compactPage" :page-count="9" compact :disabled="disabled" :pt="{ root: { 'aria-label': t('examples.compact_material_pages_0515') } }" />
    <p class="wl-text-small" role="status">{{ t("examples.default_0516") }} {{ page }} {{ t("examples.of_12_compact_0517") }} {{ compactPage }} {{ t("examples.of_9_0518") }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_compact_field_applies_the_page_number_on_enter_or_blur_the_0519") }}</p>
  </div>
</template>
