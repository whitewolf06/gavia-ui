<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlIcon } from "gavia-ui";
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlIcon
      name="folder"
      :size="24"
      role="img"
      :aria-label="t('examples.materials_folder_0069')"
      v-bind="preview"
    />
  </div>
</template>
