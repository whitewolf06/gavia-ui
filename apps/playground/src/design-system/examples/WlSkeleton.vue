<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlSkeleton } from "gavia-ui";
</script>

<template>
  <div class="wl-stack" data-space="md">
    <div
      role="status"
      :aria-label="t('examples.loading_materials_0120')"
      aria-busy="true"
      class="wl-stack"
      data-space="sm"
    >
      <WlSkeleton preset="avatar" />
      <WlSkeleton preset="text" :lines="3" v-bind="preview" />
    </div>
  </div>
</template>
