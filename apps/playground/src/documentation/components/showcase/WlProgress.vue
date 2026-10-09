<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlProgress, WlButton } from "../../../../../../packages/ui-kit/src";
const value = ref(40);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlProgress :value="64" :aria-label="t('examples.default_progress_0529')" /><WlProgress :value="32" thin :aria-label="t('examples.thin_progress_0530')" /><WlProgress :value="100" variant="ok" :aria-label="t('examples.completed_operation_0531')" />
    <WlProgress :value="value" :variant="value === 100 ? 'ok' : 'default'" show-value :aria-label="t('examples.local_preparation_progress_0532')" />
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="value === 100" @click="value = Math.min(100, value + 20)">{{ t("examples.add_20_0533") }}</WlButton><WlButton size="sm" variant="ghost" @click="value = 0">{{ t("examples.start_again_0534") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ value === 100 ? t("examples.preparation_completed_0535") : t("examples.prepared_0536") + value + '%.' }}</p>
  </div>
</template>
