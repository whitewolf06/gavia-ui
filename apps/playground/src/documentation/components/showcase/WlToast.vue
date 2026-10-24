<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { useWlToast, WlButton } from "gavia-ui";
import { ref } from "vue";
// Install WlToastService and mount one WlToast in the application root.
const toast = useWlToast();
const shown = ref(0);
function show(tone: "success" | "info" | "warning" | "danger"): void {
  const messages = {
    success: t("examples.material_saved_0143"), info: t("examples.new_version_available_0611"),
    warning: t("examples.check_available_space_0612"), danger: t("examples.could_not_save_0145")
  };
  toast.show(messages[tone], {
    tone,
    detail: tone === "danger" ? t("examples.draft_saved_try_again_0613") : t("examples.local_example_notification_0614")
  });
  shown.value++;
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm">
      <WlButton variant="soft" @click="show('success')">{{ t("examples.show_success_0615") }}</WlButton>
      <WlButton @click="show('info')">{{ t("examples.show_information_0616") }}</WlButton>
      <WlButton @click="show('warning')">{{ t("examples.show_warning_0617") }}</WlButton>
      <WlButton variant="ghost" tone="danger" @click="show('danger')">{{ t("examples.show_error_0618") }}</WlButton>
    </div>
    <p class="wl-text-small" role="status">{{ t("examples.notifications_shown_0619") }} {{ shown }}.</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.one_application_container_receives_all_messages_also_show_impo_0620") }}</p>
  </div>
</template>
