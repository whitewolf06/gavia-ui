<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlTable, WlPill } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const rows = [{ name: t("examples.team_guide_0016"), status: t("examples.done_0047") }, { name: t("examples.research_plan_0132"), status: t("examples.in_progress_0066") }];
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTable :columns="[{ key: 'name', label: t('examples.material_0074') }, { key: 'status', label: t('examples.status_0067') }]" :value="rows" :pt="{ root: { style: { overflowX: 'auto' } } }" v-bind="preview"><template #cell-status="{ value }"><WlPill variant="info" :label="String(value)" /></template></WlTable>
  </div>
</template>
