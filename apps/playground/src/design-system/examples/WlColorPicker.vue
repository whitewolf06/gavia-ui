<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlColorPicker } from "gavia-ui";
import { ref } from "vue";
const value = ref("#3c6cff");
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlColorPicker
      v-model="value"
      alpha
      custom
      :palette-label="t('examples.material_color_0028')"
      :input-label="t('examples.material_color_hex_code_0029')"
      v-bind="preview"
    />
    <p class="wl-text-small" role="status">{{ value }}</p>
  </div>
</template>
