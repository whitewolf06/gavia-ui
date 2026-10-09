<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlTabs, WlButton, type WlTabItem } from "../../../../../../packages/ui-kit/src";
const active = ref("showcase-overview");
const count = ref(3);
const items = computed<WlTabItem[]>(() => [{ key: "showcase-overview", label: t("examples.overview_0000"), icon: "file" }, { key: "showcase-notes", label: t("examples.notes_0501"), icon: "edit", count: count.value }, { key: "showcase-history", label: t("examples.history_0133"), icon: "clock" }]);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlTabs v-model="active" :items="items" :pt="{ tabList: { 'aria-label': t('examples.material_sections_0597') } }"><template #panel="{ item }"><div class="wl-stack" data-space="md"><h3 class="wl-text-subheading">{{ item.label }}</h3><p class="wl-text-body">{{ t("examples.drawer_0424") }} {{ item.key }} {{ t("examples.receives_content_from_the_scoped_slot_0598") }}</p><div v-if="item.key === 'showcase-notes'"><WlButton size="sm" @click="count++">{{ t("examples.new_note_0599") }}</WlButton><p class="wl-text-small">{{ t("examples.notes_in_the_local_example_0600") }} {{ count }}</p></div><p v-else class="wl-text-small wl-text-muted">{{ item.key === 'showcase-history' ? t("examples.today_documentation_reviewed_0601") : t("examples.home_and_end_switch_tabs_0602") }}</p></div></template></WlTabs>
    <p class="wl-text-small" role="status">{{ t("examples.active_tab_0603") }} {{ items.find(item => item.key === active)?.label }}.</p>
  </div>
</template>
