<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlIconButton } from "gavia-ui";
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlIconButton
      icon="bell"
      :aria-label="t('examples.notifications_0070')"
      :count="3"
      v-bind="preview"
    />
  </div>
</template>
