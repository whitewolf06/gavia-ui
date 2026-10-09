<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSteps, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const current = ref(1);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSteps :items="[{ label: t('examples.data_0127') }, { label: t('examples.access_0128') }, { label: t('examples.review_0129') }]" :current="current" v-bind="preview" /><WlButton size="sm" @click="current = (current + 1) % 3">{{ t("examples.next_step_0130") }}</WlButton>
  </div>
</template>
