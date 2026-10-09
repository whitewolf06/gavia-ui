<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { nextTick, ref } from "vue";
import { WlAlert, WlButton } from "../../../../../../packages/ui-kit/src";
const error = ref(true);
const attempts = ref(0);
const errorRegion = ref<HTMLElement | null>(null);
async function showError(visible: boolean, retry = false): Promise<void> {
  if (retry) attempts.value++;
  error.value = visible;
  await nextTick();
  errorRegion.value?.querySelector<HTMLButtonElement>("button")?.focus();
}
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlAlert variant="info" :title="t('examples.tip_0309')">{{ t("examples.your_application_saves_the_settings_0310") }}</WlAlert>
    <WlAlert variant="ok" :title="t('examples.saved_0311')">{{ t("examples.all_changes_are_recorded_in_the_local_example_0312") }}</WlAlert>
    <WlAlert variant="warn" :title="t('examples.low_on_space_0313')">{{ t("examples.free_up_space_before_adding_another_attachment_0314") }}<template #action><WlButton size="sm" @click="attempts++">{{ t("examples.check_space_0315") }}</WlButton></template></WlAlert>
    <div ref="errorRegion"><WlAlert v-if="error" variant="err" :title="t('examples.could_not_save_0145')" closable :close-label="t('examples.hide_error_message_0316')" @close="showError(false)">{{ t("examples.the_draft_is_saved_try_again_0317") }}<template #action><WlButton size="sm" @click="showError(false, true)">{{ t("examples.retry_saving_0235") }}</WlButton></template></WlAlert>
    <div v-else><WlButton size="sm" variant="soft" @click="showError(true)">{{ t("examples.show_error_again_0318") }}</WlButton></div></div>
    <p class="wl-text-small" role="status">{{ t("examples.checks_in_this_example_0319") }} {{ attempts }}{{ t("examples.error_0320") }} {{ error ? t("examples.visible_0321") : t("examples.hidden_0322") }}.</p>
  </div>
</template>
