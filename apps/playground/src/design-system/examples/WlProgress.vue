<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlProgress } from "gavia-ui";
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlProgress
      :value="65"
      show-value
      :aria-label="t('examples.material_completion_0108')"
      v-bind="preview"
    />
  </div>
</template>
