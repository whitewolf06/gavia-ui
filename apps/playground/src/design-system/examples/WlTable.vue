<script setup lang="ts">
import { WlTable, WlPill } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const rows = [{ name: 'Руководство команды', status: 'Готово' }, { name: 'План исследования', status: 'В работе' }];
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTable :columns="[{ key: 'name', label: 'Материал' }, { key: 'status', label: 'Статус' }]" :value="rows" :pt="{ root: { style: { overflowX: 'auto' } } }" v-bind="preview"><template #cell-status="{ value }"><WlPill variant="info" :label="String(value)" /></template></WlTable>
  </div>
</template>
