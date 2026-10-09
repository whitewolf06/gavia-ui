<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlStatCard } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlStatCard icon="task" :label="t('examples.completed_0124')" value="24" :description="t('examples.of_32_materials_0125')" :progress="75" v-bind="preview"><template #footer>{{ t("examples.over_the_past_week_0126") }}</template></WlStatCard>
  </div>
</template>
