<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlColorPicker } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('#3c6cff');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlColorPicker v-model="value" :palette-label="t('examples.material_color_0028')" :input-label="t('examples.material_color_hex_code_0029')" v-bind="preview" />
  </div>
</template>
