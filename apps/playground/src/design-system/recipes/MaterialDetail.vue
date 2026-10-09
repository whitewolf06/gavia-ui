<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlTabs, WlTag, WlAvatar, WlCard, WlButton, WlDialog, WlField, WlTextarea, WlAlert } from "../../../../../packages/ui-kit/src";
const tab = ref("recipe-detail-overview");
const editing = ref(false);
const description = ref(t("examples.how_we_discuss_changes_assign_roles_and_record_agreements_0162"));
const draft = ref("");
const saved = ref(false);
function edit(): void { draft.value = description.value; saved.value = false; editing.value = true; }
function save(): void { description.value = draft.value; editing.value = false; saved.value = true; }
</script>

<template>
  <section class="wl-stack" data-space="lg" :aria-label="t('examples.material_page_0163')">
    <WlPageHeader :title="t('examples.team_guide_0016')" :description="t('examples.how_the_team_works_and_makes_decisions_0164')" :heading-level="2" size="md">
      <template #breadcrumbs><WlBreadcrumbs :items="[{ label: t('examples.materials_0015'), href: '#ds-recipes' }, { label: t('examples.team_guide_0016') }]" /></template>
      <template #meta><div class="wl-inline" data-space="sm"><WlTag variant="green">{{ t("examples.published_0165") }}</WlTag><WlAvatar :label="t('examples.am_0013')" :size="24" :aria-label="t('examples.author_anna_mikhailova_0166')" /><span class="wl-text-small wl-text-muted">{{ t("examples.anna_mikhailova_october_1_0167") }}</span></div></template>
      <template #actions><WlButton @click="edit">{{ t("examples.edit_description_0168") }}</WlButton></template>
    </WlPageHeader>
    <WlAlert v-if="saved" variant="ok" :title="t('examples.description_saved_0169')">{{ t("examples.material_updated_0170") }}</WlAlert>
    <WlTabs v-model="tab" :items="[{ key: 'recipe-detail-overview', label: t('examples.overview_0000') }, { key: 'recipe-detail-history', label: t('examples.history_0133'), count: 2 }]">
      <template #panel="{ item }">
        <WlCard v-if="item.key === 'recipe-detail-overview'"><template #title>{{ t("examples.about_the_material_0050") }}</template><p class="wl-text-body ds-recipe-description">{{ description || t("examples.no_description_yet_0171") }}</p></WlCard>
        <ol v-else class="ds-recipe-history wl-text-body"><li>{{ t("examples.october_1_description_updated_0172") }}</li><li>{{ t("examples.september_30_material_published_0173") }}</li></ol>
      </template>
    </WlTabs>
    <WlDialog v-model:visible="editing" :header="t('examples.material_description_0139')" width="540px">
      <form id="recipe-detail-form" @submit.prevent="save"><WlField id="recipe-detail-description" :label="t('examples.description_0174')" :hint="t('examples.up_to_600_characters_0175')" v-slot="field"><WlTextarea :id="field.id" v-model="draft" :aria-describedby="field.ariaDescribedby" maxlength="600" :rows="5" /></WlField></form>
      <template #footer><WlButton variant="ghost" @click="editing = false">{{ t("examples.cancel_0038") }}</WlButton><WlButton variant="primary" type="submit" form="recipe-detail-form">{{ t("examples.save_description_0176") }}</WlButton></template>
    </WlDialog>
  </section>
</template>

<style scoped>
.ds-recipe-description { white-space: pre-wrap; overflow-wrap: anywhere; }
.ds-recipe-history { padding-left: var(--wl-space-xl); }
.ds-recipe-history li + li { margin-top: var(--wl-space-md); }
</style>
