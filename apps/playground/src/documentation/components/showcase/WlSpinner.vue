<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSpinner, WlButton } from "../../../../../../packages/ui-kit/src";
const busy = ref(true);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="lg"><WlSpinner size="sm" :label="t('examples.small_loading_indicator_0563')" /><WlSpinner size="md" :label="t('examples.medium_loading_indicator_0564')" /><WlSpinner size="lg" :label="t('examples.large_loading_indicator_0565')" /><span class="showcase-spinner-dark"><WlSpinner light :label="t('examples.light_indicator_on_a_dark_background_0566')" /></span></div>
    <div class="wl-inline" data-space="sm"><WlSpinner v-if="busy" :label="t('examples.loading_materials_0120')" /><span>{{ busy ? t("examples.loading_materials_0567") : t("examples.materials_ready_0568") }}</span></div>
    <div><WlButton @click="busy = !busy">{{ busy ? t("examples.finish_loading_0569") : t("examples.retry_upload_0157") }}</WlButton></div>
  </div>
</template>
<style scoped>
.showcase-spinner-dark { display: inline-flex; padding: var(--wl-space-md); border-radius: var(--wl-corner-control); background: var(--wl-gray-800); }
</style>
