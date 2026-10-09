<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlPageHeader, WlButton, WlTag, WlMultiSelect, WlField, WlInput, WlTable, WlDatePicker, WlDrawer, WlDialog } from "../../../../packages/ui-kit/src";
const long = ref(true);
const title = computed(() => long.value ? t('shell.design_system.ContentStress.text422') : t('shell.design_system.ContentStress.text423'));
const options = Array.from({ length: 80 }, (_, index) => ({ label: t('shell.design_system.ContentStress.text424', { arg0: index + 1 }), value: index }));
const selected = ref([0, 1, 2, 3, 4, 5, 6, 7]);
const date = ref<string | null>("2026-10-15");
const outer = ref(false);
const inner = ref(false);
const rows = computed(() => Array.from({ length: 20 }, (_, index) => ({ name: `${title.value} · ${index + 1}`, reference: "research_material_without_spaces_2026_10_01_abcdefghijklmnopqrstuvwxyz" })));
</script>

<template>
  <div class="ds-stress wl-stack" data-space="lg" data-testid="ds-stress">
    <div class="wl-inline" data-space="sm"><WlButton :aria-pressed="long" @click="long = !long">{{ t('shell.design_system.ContentStress.text425') }}</WlButton><WlButton @click="outer = true">{{ t('shell.design_system.ContentStress.text426') }}</WlButton></div>
    <div class="wl-surface wl-stack" data-space="lg">
      <WlPageHeader :title="title" :description="t('shell.design_system.ContentStress.text427')" :heading-level="2" size="md"><template #actions><WlButton class="ds-stress-action" variant="primary">{{ t('shell.design_system.ContentStress.text428') }}</WlButton><WlButton class="ds-stress-action" variant="ghost">{{ t('shell.design_system.ContentStress.text429') }}</WlButton></template></WlPageHeader>
      <div class="wl-inline" data-space="sm"><WlTag v-for="index in 8" :key="index">{{ t('shell.design_system.ContentStress.text430') }} {{ index }}</WlTag></div>
      <WlMultiSelect v-model="selected" :options="options" option-label="label" option-value="value" :max-selected-labels="3" display="comma" filter :aria-label="t('shell.design_system.ContentStress.text431')" />
      <WlField :label="t('shell.design_system.ContentStress.text432')" id="ds-stress-invalid" :error="t('shell.design_system.ContentStress.text433')" v-slot="field"><WlInput :id="field.id" :model-value="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" /></WlField>
      <WlField :label="t('shell.design_system.ContentStress.text434')" id="ds-stress-date" :hint="t('shell.design_system.ContentStress.text435')" v-slot="field"><WlDatePicker :id="field.id" v-model="date" :aria-describedby="field.ariaDescribedby" min-date="2026-10-01" max-date="2026-10-31" show-icon /></WlField>
      <div class="ds-stress-table" role="region" :aria-label="t('shell.design_system.ContentStress.text436')" tabindex="0"><WlTable :columns="[{ key: 'name', label: t('shell.design_system.ContentStress.text437') }, { key: 'reference', label: t('shell.design_system.ContentStress.text438') }]" :value="rows" /></div>
    </div>
    <WlDrawer v-model:visible="outer" :header="t('shell.design_system.ContentStress.text439')">
      <div class="wl-stack" data-space="lg"><p class="wl-text-body">{{ title }}</p><WlButton @click="inner = true">{{ t('shell.design_system.ContentStress.text440') }}</WlButton><p v-for="index in 16" :key="index" class="wl-text-small wl-text-muted">{{ t('shell.design_system.ContentStress.text441') }} {{ index }}{{ t('shell.design_system.ContentStress.text442') }}</p></div>
      <template #footer><WlButton @click="outer = false">{{ t('shell.design_system.ContentStress.text443') }}</WlButton></template>
    </WlDrawer>
    <WlDialog v-model:visible="inner" :header="t('shell.design_system.ContentStress.text444')"><p class="wl-text-body">{{ t('shell.design_system.ContentStress.text445') }}</p><template #footer><WlButton @click="inner = false">{{ t('shell.design_system.ContentStress.text446') }}</WlButton></template></WlDialog>
  </div>
</template>

<style>
.ds-stress { overflow-wrap: anywhere; }
.ds-stress-table { overflow: auto; max-height: 300px; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.ds-stress-table .wl-table { min-width: 640px; }
.ds-stress-action { max-width: 100%; height: auto; min-height: var(--wl-control-height-md); padding-block: var(--wl-space-sm); white-space: normal; }
</style>
