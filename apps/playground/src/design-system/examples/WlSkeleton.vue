<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlSkeleton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <div role="status" :aria-label="t('examples.loading_materials_0120')" aria-busy="true"><WlSkeleton height="24px" v-bind="preview" /></div>
  </div>
</template>
