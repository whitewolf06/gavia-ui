<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSlider } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(40);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSlider v-model="value" :min="0" :max="100" :step="10" :aria-label="t('examples.volume_0121')" v-bind="preview" /><p class="wl-text-small">{{ t("examples.volume_0122") }} {{ value }}%</p>
  </div>
</template>
