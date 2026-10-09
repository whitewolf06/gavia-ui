<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlFilterBar, WlInput, WlSelect, WlTag } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const search = ref('');
const status = ref<string | null>(null);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlFilterBar :active-count="Number(Boolean(search)) + Number(Boolean(status))" v-bind="preview" @clear="search = ''; status = null"><template #leading><WlInput v-model="search" type="search" :aria-label="t('examples.search_materials_0064')" :placeholder="t('examples.search_0065')" /></template><WlSelect v-model="status" :options="[{ label: t('examples.done_0047'), value: 'done' }, { label: t('examples.in_progress_0066'), value: 'progress' }]" option-label="label" option-value="value" :aria-label="t('examples.status_0067')" :placeholder="t('examples.all_statuses_0068')" /><template #summary><WlTag v-if="status" removable @remove="status = null">{{ status }}</WlTag></template></WlFilterBar>
  </div>
</template>
