<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCommandPalette, WlButton, WlCheckbox, type WlCommandPaletteGroup } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const query = ref("");
const loading = ref(false);
const selected = ref("");
const groups: WlCommandPaletteGroup[] = [
  { id: "quick", label: t("examples.quick_actions_0369"), showWhenEmpty: true, items: [{ id: "new", label: t("examples.new_material_0203"), description: t("examples.create_a_local_draft_0370"), icon: "plus" }, { id: "settings", label: t("examples.settings_0119"), icon: "settings" }] },
  { id: "materials", label: t("examples.materials_0015"), items: [{ id: "plan", label: t("examples.release_plan_0371"), description: t("examples.team_document_0372"), keywords: [t("examples.plan_0373"), t("examples.release_0374")], icon: "file" }, { id: "report", label: t("examples.report_0375"), icon: "file", disabled: true }] }
];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="loading">{{ t("examples.show_results_loading_0376") }}</WlCheckbox>
    <div><WlButton @click="visible = true">{{ t("examples.open_material_search_0377") }}</WlButton></div>
    <WlCommandPalette v-model:visible="visible" v-model:query="query" :groups="loading ? [] : groups" :loading="loading" :aria-label="t('examples.search_example_materials_0378')" @select="selected = $event.label"><template #group="{ group }"><strong>{{ group.label }}</strong></template><template #empty="{ query: text }"><div class="wl-stack" data-space="sm"><span>{{ t("examples.nothing_found_for_0379") }}{{ text }}{{ t("examples.text_0380") }}</span><div><WlButton size="sm" @click="query = ''">{{ t("examples.clear_search_input_0381") }}</WlButton></div></div></template><template #footer><p class="wl-text-small wl-text-muted">{{ t("examples.select_enter_act_escape_close_0382") }}</p></template></WlCommandPalette>
    <p class="wl-text-small" role="status">{{ selected ? t("examples.selected_0059") + selected : t("examples.quick_actions_are_visible_immediately_search_reveals_other_gro_0383") }}</p>
    <p class="wl-text-small wl-text-muted">{{ t("examples.the_shortcut_is_disabled_in_this_example_enable_ctrl_cmd_k_for_0384") }}</p>
  </div>
</template>
