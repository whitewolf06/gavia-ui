<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlNavItem, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const active = ref<"tasks" | "notes" | "profile">("tasks");
const collapsed = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="collapsed">{{ t("examples.collapse_item_labels_0498") }}</WlCheckbox>
    <nav class="showcase-nav wl-stack" data-space="xs" :aria-label="t('examples.workspace_sections_0499')">
      <WlNavItem :label="t('examples.tasks_0500')" icon="check" :badge="12" :active="active === 'tasks'" :collapsed="collapsed" @click="active = 'tasks'" />
      <WlNavItem :label="t('examples.notes_0501')" icon="edit" :badge="4" :active="active === 'notes'" :collapsed="collapsed" @click="active = 'notes'" />
      <WlNavItem :label="t('examples.profile_0502')" icon="user" :active="active === 'profile'" :collapsed="collapsed" @click="active = 'profile'"><span>{{ t("examples.my_profile_0503") }}</span></WlNavItem>
      <WlNavItem :label="t('examples.archive_0113')" icon="trash" disabled :collapsed="collapsed" />
      <WlNavItem :label="t('examples.documentation_0340')" icon="file" href="?view=docs" :collapsed="collapsed" />
    </nav>
    <p class="wl-text-small" role="status">{{ t("examples.selected_section_0504") }} {{ { tasks: t("examples.tasks_0500"), notes: t("examples.notes_0501"), profile: t("examples.profile_0502") }[active] }}.</p>
  </div>
</template>
<style scoped>
.showcase-nav { max-width: 260px; }
</style>
