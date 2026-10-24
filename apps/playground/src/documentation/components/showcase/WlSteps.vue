<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, type WlStepItem, WlSteps } from "gavia-ui";
import { computed, ref } from "vue";
const current = ref(1);
const error = ref(true);
const items = computed<readonly WlStepItem[]>(() => [
  { key: "data", label: t("examples.data_0127"), description: t("examples.reviewStepData") },
  { key: "access", label: t("examples.access_0128"), description: t("examples.reviewStepAccess"), error: error.value },
  { key: "review", label: t("examples.review_0129"), description: t("examples.reviewStepReview") }
]);
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <WlSteps
      v-model:current="current"
      :items="items"
      clickable
      :aria-label="t('examples.material_preparation_steps_0580')"
    />
    <WlSteps
      v-model:current="current"
      :items="items"
      clickable
      orientation="vertical"
      :aria-label="t('examples.reviewStepVertical')"
    />
    <div class="wl-inline" data-space="sm">
      <WlButton size="sm" :disabled="current === 0" @click="current--">{{ t("examples.previous_step_0581") }}</WlButton>
      <WlButton size="sm" :disabled="current === items.length - 1" @click="current++">{{ t("examples.next_step_0130") }}</WlButton>
      <WlButton size="sm" variant="ghost" @click="error = !error">{{ t("examples.reviewStepToggleError") }}</WlButton>
      <WlButton size="sm" variant="ghost" @click="current = 0; error = true">{{ t("examples.start_over_0582") }}</WlButton>
    </div>
    <p class="wl-text-small" role="status">
      {{ t("examples.step_0246") }} {{ current + 1 }} {{ t("examples.of_0201") }} {{ items.length }}: {{ items[current]?.label }}.
    </p>
  </div>
</template>
