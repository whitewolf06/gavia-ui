<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSteps, WlButton, type WlStepItem } from "../../../../../../packages/ui-kit/src";
const current = ref(1);
const items: WlStepItem[] = [{ label: t("examples.data_0127") }, { label: t("examples.review_0129") }, { label: t("examples.done_0047") }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlSteps :items="items" :current="current" role="group" :aria-label="t('examples.material_preparation_steps_0580')" />
    <div class="wl-inline" data-space="sm"><WlButton size="sm" :disabled="current === 0" @click="current--">{{ t("examples.previous_step_0581") }}</WlButton><WlButton size="sm" variant="primary" :disabled="current === items.length - 1" @click="current++">{{ t("examples.next_step_0130") }}</WlButton><WlButton size="sm" variant="ghost" @click="current = 0">{{ t("examples.start_over_0582") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ t("examples.step_0246") }} {{ current + 1 }} {{ t("examples.of_0201") }} {{ items.length }}: {{ items[current]?.label }}.</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_indicator_does_not_change_steps_itself_the_application_own_0583") }}</p>
  </div>
</template>
