<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSidebar, WlButton, WlIcon, type WlSidebarGroup, type WlSidebarItem } from "../../../../../../packages/ui-kit/src";
const active = ref("materials");
const pinned = ref(true);
const mobileOpen = ref(false);
const groups: WlSidebarGroup[] = [{ id: "work", label: t("examples.work_0542"), items: [{ key: "materials", label: t("examples.materials_0015"), icon: "file", badge: 12 }, { key: "tasks", label: t("examples.tasks_0500"), icon: "check", badge: 3 }] }, { id: "team", label: t("examples.team_0086"), separator: true, items: [{ key: "people", label: t("examples.members_0543"), icon: "user" }, { key: "archive", label: t("examples.archive_0113"), icon: "folder", disabled: true }] }];
const footerItems: WlSidebarItem[] = [{ key: "settings", label: t("examples.settings_0119"), icon: "settings" }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="pinned = !pinned">{{ pinned ? t("examples.unpin_sidebar_0544") : t("examples.pin_sidebar_0545") }}</WlButton><WlButton class="showcase-sidebar-mobile" size="sm" @click="mobileOpen = true">{{ t("examples.open_mobile_sidebar_0546") }}</WlButton></div>
    <div class="showcase-sidebar-stage">
      <WlSidebar v-model="active" v-model:pinned="pinned" v-model:mobile-open="mobileOpen" :groups="groups" :footer-items="footerItems" :brand="t('examples.team_0086')" :brand-mark="t('examples.t_0118')" :aria-label="t('examples.example_team_navigation_0547')"><template #brand-mark><span class="showcase-sidebar-mark"><WlIcon name="grid" :size="18" /></span></template><template #footer="{ expanded }"><p v-if="expanded" class="wl-text-small wl-text-muted">{{ t("examples.local_example_0548") }}</p></template></WlSidebar>
      <div class="showcase-sidebar-content wl-stack" data-space="md"><h3 class="wl-text-subheading">{{ t("examples.active_item_0549") }} {{ active }}</h3><p class="wl-text-body">{{ t("examples.hover_expands_the_unpinned_sidebar_on_mobile_a_button_opens_th_0550") }}</p><p class="wl-text-small" role="status">{{ t("examples.pinned_0551") }} {{ pinned ? t("examples.yes_0552") : t("examples.none_0306") }}{{ t("examples.mobile_sidebar_0553") }} {{ mobileOpen ? t("examples.open_0554") : t("examples.closed_0555") }}.</p></div>
    </div>
  </div>
</template>
<style scoped>
.showcase-sidebar-stage { height: 380px; display: flex; min-width: 0; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.showcase-sidebar-content { min-width: 0; flex: 1; padding: var(--wl-space-lg); overflow: auto; }
.showcase-sidebar-mark { display: inline-flex; align-items: center; justify-content: center; padding: var(--wl-space-xs); }
.showcase-sidebar-mobile { display: none; }
@media (max-width: 900px) { .showcase-sidebar-mobile { display: inline-flex; } }
</style>
