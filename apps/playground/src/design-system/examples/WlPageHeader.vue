<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlButton, WlTag } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const changed = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlPageHeader :title="t('examples.team_materials_0083')" :description="t('examples.working_agreements_and_documentation_0085')" :heading-level="2" v-bind="preview"><template #breadcrumbs><WlBreadcrumbs :items="[{ label: t('examples.team_0086'), href: '#ds-components' }, { label: t('examples.materials_0015') }]" /></template><template #meta><WlTag>{{ t("examples.12_materials_0087") }}</WlTag></template><template #actions><WlButton @click="changed = true">{{ t("examples.add_0017") }}</WlButton></template></WlPageHeader><p v-if="changed" role="status">{{ t("examples.material_added_0055") }}</p>
  </div>
</template>
