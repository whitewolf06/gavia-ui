<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlButton, WlCheckbox, WlPill, WlSegmented, type WlSizeSm } from "../../../../../../packages/ui-kit/src";
const size = ref<WlSizeSm>("lg");
const compact = ref(false);
const view = ref<"list" | "grid" | null>("list");
const added = ref(0);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton v-for="value in (['sm', 'md', 'lg'] as const)" :key="value" size="sm" :aria-pressed="size === value" @click="size = value">{{ value }}</WlButton><WlCheckbox v-model="compact">{{ t("examples.compact_header_0505") }}</WlCheckbox></div>
    <WlPageHeader :heading-level="2" :size="size" :density="compact ? 'compact' : 'default'">
      <template #breadcrumbs><WlBreadcrumbs :items="[{ label: 'Gavia UI', href: '?' }, { label: t('examples.documentation_0340'), href: '?view=docs' }, { label: t('examples.materials_0015') }]" /></template>
      <template #eyebrow>{{ t("examples.workspace_0506") }}</template><template #title>{{ t("examples.team_materials_0083") }}</template><template #description>{{ t("examples.actions_and_metadata_adapt_to_the_available_width_0507") }}</template>
      <template #meta><WlPill variant="info" :label="t('examples.24_active_0508')" /><span>{{ t("examples.updated_today_0358") }}</span></template>
      <template #actions><WlButton size="sm" variant="primary" @click="added++">{{ t("examples.new_material_0203") }}</WlButton><WlButton size="sm" disabled>{{ t("examples.export_unavailable_0509") }}</WlButton></template>
      <template #navigation><WlSegmented v-model="view" :options="[{ label: t('examples.list_0111'), value: 'list', icon: 'list' }, { label: t('examples.grid_0112'), value: 'grid', icon: 'grid' }]" :aria-label="t('examples.material_list_view_0510')" /></template>
    </WlPageHeader>
    <p class="wl-text-small" role="status">{{ t("examples.view_0511") }} {{ view === 'list' ? t("examples.list_0111") : t("examples.grid_0112") }}{{ t("examples.new_materials_in_this_example_0512") }} {{ added }}.</p>
  </div>
</template>
