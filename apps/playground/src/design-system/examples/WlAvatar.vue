<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlAvatar } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAvatar :label="t('examples.am_0013')" presence="online" :aria-label="t('examples.anna_mikhailova_online_0014')" v-bind="preview" />
  </div>
</template>
