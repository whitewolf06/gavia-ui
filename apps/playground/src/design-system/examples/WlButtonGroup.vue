<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButtonGroup, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selected = ref('day');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButtonGroup :aria-label="t('examples.period_0019')" v-bind="preview"><WlButton :variant="selected === 'day' ? 'primary' : 'secondary'" @click="selected = 'day'">{{ t("examples.day_0020") }}</WlButton><WlButton :variant="selected === 'week' ? 'primary' : 'secondary'" @click="selected = 'week'">{{ t("examples.week_0021") }}</WlButton></WlButtonGroup>
  </div>
</template>
