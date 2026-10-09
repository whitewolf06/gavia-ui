<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlMenu, WlButton, type WlMenuItem, type WlMenuExpose } from "../../../../../../packages/ui-kit/src";
const popup = ref<WlMenuExpose | null>(null);
const message = ref(t("examples.no_command_selected_yet_0488"));
const items: WlMenuItem[] = [
  { header: t("examples.material_0074") },
  { key: "edit", label: t("examples.edit_0033"), icon: "edit", shortcut: "Ctrl+E", command: () => message.value = t("examples.editing_opened_0489") },
  { key: "copy", label: t("examples.copy_link_0490"), icon: "copy", command: () => message.value = t("examples.local_copy_example_0491") },
  { key: "export", label: t("examples.export_0492"), icon: "download", disabled: true },
  { separator: true },
  { key: "remove", label: t("examples.delete_0037"), icon: "trash", danger: true, command: () => message.value = t("examples.deletion_selected_the_application_adds_confirmation_0493") }
];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlMenu :items="items" :aria-label="t('examples.static_material_commands_0494')" /></div>
    <div><WlButton @click="popup?.toggle($event)">{{ t("examples.open_popup_menu_0495") }}</WlButton><WlMenu ref="popup" popup :items="items" :aria-label="t('examples.material_popup_commands_0496')" /></div>
    <p class="wl-text-small" role="status">{{ message }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.home_and_end_move_focus_escape_closes_the_popup_shortcut_displ_0497") }}</p>
  </div>
</template>
