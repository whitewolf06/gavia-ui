<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSidebar, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref('materials');
const mobileOpen = ref(false);
const pinned = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="mobileOpen = true">{{ t("examples.open_navigation_0117") }}</WlButton><WlSidebar v-model="active" v-model:mobile-open="mobileOpen" v-model:pinned="pinned" :brand="t('examples.team_0086')" :brand-mark="t('examples.t_0118')" :groups="[{ id: 'main', items: [{ key: 'materials', label: t('examples.materials_0015'), icon: 'file' }, { key: 'settings', label: t('examples.settings_0119'), icon: 'settings' }] }]" v-bind="preview" />
  </div>
</template>
