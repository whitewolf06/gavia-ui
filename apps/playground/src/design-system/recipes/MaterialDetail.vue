<script setup lang="ts">
import { ref } from "vue";
import { WlPageHeader, WlBreadcrumbs, WlTabs, WlTag, WlAvatar, WlCard, WlButton, WlDialog, WlField, WlTextarea, WlAlert } from "../../../../../packages/ui-kit/src";
const tab = ref("recipe-detail-overview");
const editing = ref(false);
const description = ref("Как мы обсуждаем изменения, распределяем роли и сохраняем договорённости.");
const draft = ref("");
const saved = ref(false);
function edit(): void { draft.value = description.value; saved.value = false; editing.value = true; }
function save(): void { description.value = draft.value; editing.value = false; saved.value = true; }
</script>

<template>
  <section class="wl-stack" data-space="lg" aria-label="Деталь материала">
    <WlPageHeader title="Руководство команды" description="Единый источник рабочих договорённостей." :heading-level="2" size="md">
      <template #breadcrumbs><WlBreadcrumbs :items="[{ label: 'Материалы', href: '#ds-recipes' }, { label: 'Руководство команды' }]" /></template>
      <template #meta><div class="wl-inline" data-space="sm"><WlTag variant="green">Опубликовано</WlTag><WlAvatar label="АМ" :size="24" aria-label="Автор Анна Михайлова" /><span class="wl-text-small wl-text-muted">Анна Михайлова · 1 октября</span></div></template>
      <template #actions><WlButton @click="edit">Редактировать описание</WlButton></template>
    </WlPageHeader>
    <WlAlert v-if="saved" variant="ok" title="Описание сохранено">Материал обновлён.</WlAlert>
    <WlTabs v-model="tab" :items="[{ key: 'recipe-detail-overview', label: 'Обзор' }, { key: 'recipe-detail-history', label: 'История', count: 2 }]">
      <template #panel="{ item }">
        <WlCard v-if="item.key === 'recipe-detail-overview'"><template #title>О материале</template><p class="wl-text-body ds-recipe-description">{{ description || 'Описание пока не добавлено.' }}</p></WlCard>
        <ol v-else class="ds-recipe-history wl-text-body"><li>1 октября — обновлено описание.</li><li>30 сентября — материал опубликован.</li></ol>
      </template>
    </WlTabs>
    <WlDialog v-model:visible="editing" header="Описание материала" width="540px">
      <form id="recipe-detail-form" @submit.prevent="save"><WlField id="recipe-detail-description" label="Описание" hint="До 600 символов." v-slot="field"><WlTextarea :id="field.id" v-model="draft" :aria-describedby="field.ariaDescribedby" maxlength="600" :rows="5" /></WlField></form>
      <template #footer><WlButton variant="ghost" @click="editing = false">Отмена</WlButton><WlButton variant="primary" type="submit" form="recipe-detail-form">Сохранить описание</WlButton></template>
    </WlDialog>
  </section>
</template>

<style scoped>
.ds-recipe-description { white-space: pre-wrap; overflow-wrap: anywhere; }
.ds-recipe-history { padding-left: var(--wl-space-xl); }
.ds-recipe-history li + li { margin-top: var(--wl-space-md); }
</style>
