<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlPill } from "gavia-ui";
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPill :label="t('examples.in_progress_0066')" v-bind="preview" />
  </div>
</template>
