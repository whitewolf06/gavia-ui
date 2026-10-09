<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, useWlConfirm } from "../../../../../../packages/ui-kit/src";
// Install WlConfirmationService and mount one WlConfirmDialog in the root.
const confirm = useWlConfirm();
const removed = ref(false);
const result = ref(t("examples.choose_an_action_0385"));
function share(): void { confirm.confirm({ header: t("examples.share_the_plan_0386"), message: t("examples.only_the_local_status_changes_in_this_example_0387"), acceptLabel: t("examples.share_0292"), rejectLabel: t("examples.not_now_0388"), accept: () => result.value = t("examples.the_plan_is_marked_as_shared_0389"), reject: () => result.value = t("examples.publication_cancelled_0390") }); }
function remove(): void { confirm.confirmDanger({ header: t("examples.delete_draft_0391"), message: t("examples.save_any_data_you_need_before_deleting_0392"), acceptLabel: t("examples.delete_draft_0273"), rejectLabel: t("examples.keep_0393"), accept: () => { removed.value = true; result.value = t("examples.draft_deleted_in_the_local_example_0394"); }, reject: () => result.value = t("examples.draft_kept_0395") }); }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton @click="share">{{ t("examples.share_plan_0396") }}</WlButton><WlButton variant="danger" :disabled="removed" @click="remove">{{ t("examples.delete_with_confirmation_0397") }}</WlButton><WlButton v-if="removed" variant="ghost" @click="removed = false; result = t('examples.draft_restored_to_try_again_0398')">{{ t("examples.repeat_example_0399") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ result }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.regular_confirm_and_destructive_confirmdanger_share_one_contai_0400") }}</p>
  </div>
</template>
