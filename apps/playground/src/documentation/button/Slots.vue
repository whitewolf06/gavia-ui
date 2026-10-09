<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlIcon } from "../../../../../packages/ui-kit/src";
const lastAction = ref("");
const unread = ref(3);
function readMessages(): void {
  unread.value = 0;
  lastAction.value = t("examples.messages_marked_as_read_0270");
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md">
      <WlButton variant="primary" @click="lastAction = t('examples.new_task_0271')">
        <template #icon><WlIcon name="plus" :size="16" /></template>
        {{ t("examples.new_task_0271") }}
      </WlButton>
      <WlButton @click="lastAction = t('examples.find_0272')">
        <template #icon><WlIcon name="search" :size="16" /></template>
        {{ t("examples.find_0272") }}
      </WlButton>
      <WlButton @click="lastAction = t('examples.continue_0253')">
        <span class="button-slot-inline">{{ t("examples.continue_0253") }}<WlIcon name="arrow-right" :size="16" /></span>
      </WlButton>
      <WlButton variant="danger-quiet" :aria-label="t('examples.delete_draft_0273')" @click="lastAction = t('examples.draft_deleted_0274')">
        <template #icon><WlIcon name="trash" :size="16" /></template>
      </WlButton>
      <WlButton variant="soft" @click="readMessages">
        <span class="button-slot-inline">{{ t("examples.messages_0275") }}<strong>{{ unread }}</strong></span>
      </WlButton>
    </div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.icon_places_an_icon_on_the_left_the_default_slot_can_hold_an_i_0276") }}</p>
    <p class="wl-text-small" role="status">{{ lastAction ? t("examples.last_action_0277") + lastAction : t("examples.click_a_button_and_check_its_action_and_accessible_name_0278") }}</p>
  </div>
</template>

<style scoped>
.button-slot-inline { display: inline-flex; align-items: center; gap: var(--wl-space-sm); }
</style>
