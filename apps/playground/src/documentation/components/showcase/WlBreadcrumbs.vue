<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlBreadcrumbs, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const short = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="short">{{ t("examples.short_path_0339") }}</WlCheckbox>
    <WlBreadcrumbs :items="short ? [{ label: 'Gavia UI', href: '?', icon: 'home' }, { label: t('examples.materials_0015') }] : [{ label: 'Gavia UI', href: '?', icon: 'home' }, { label: t('examples.documentation_0340'), href: '?view=docs' }, { label: t('examples.materials_0015') }]" :pt="{ root: { 'aria-label': t('examples.path_to_materials_0341') } }" />
    <WlBreadcrumbs :items="[{ label: t('examples.current_page_without_parents_0342') }]" :pt="{ root: { 'aria-label': t('examples.single_level_path_0343') } }" />
    <p class="wl-text-small wl-text-muted">{{ t("examples.parent_items_are_links_the_last_item_receives_aria_current_pag_0344") }}</p>
  </div>
</template>
