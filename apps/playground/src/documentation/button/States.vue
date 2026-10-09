<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlCheckbox, WlIcon } from "../../../../../packages/ui-kit/src";
const noAccess = ref(false);
const loading = ref(false);
const saved = ref(0);
const message = ref(t("examples.click_save_then_complete_or_cancel_the_local_loading_state_0279"));
function finish(): void {
  loading.value = false;
  saved.value++;
  message.value = t("examples.saving_completed_0280");
}
function cancel(): void {
  loading.value = false;
  message.value = t("examples.loading_cancelled_you_can_save_again_0281");
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md">
      <WlButton disabled aria-describedby="button-disabled-reason">{{ t("examples.unavailable_0076") }}</WlButton>
      <WlButton variant="primary" loading>{{ t("examples.saving_0282") }}</WlButton>
    </div>
    <p id="button-disabled-reason" class="wl-text-small wl-text-muted">{{ t("examples.disabled_blocks_the_action_loading_also_blocks_the_button_and_0283") }}</p>
    <WlCheckbox v-model="noAccess">{{ t("examples.no_permission_to_save_0284") }}</WlCheckbox>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" :disabled="noAccess" :loading="loading" aria-describedby="button-saving-reason" @click="loading = true">
        <template #icon><WlIcon name="check" :size="16" /></template>
        {{ loading ? t("examples.saving_0285") : t("examples.save_0026") }}
      </WlButton>
      <WlButton v-if="loading" @click="finish">{{ t("examples.complete_saving_0286") }}</WlButton>
      <WlButton v-if="loading" variant="ghost" @click="cancel">{{ t("examples.cancel_upload_0161") }}</WlButton>
    </div>
    <p id="button-saving-reason" class="wl-text-small wl-text-muted">{{ noAccess ? t("examples.this_action_requires_editing_permission_0287") : t("examples.no_requests_are_sent_complete_or_cancel_this_example_manually_0288") }}</p>
    <p class="wl-text-small" role="status">{{ message }} {{ t("examples.saves_0289") }} {{ saved }}.</p>
  </div>
</template>
