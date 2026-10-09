<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlMultiSelect } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(['design', 'code']);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMultiSelect v-model="value" :options="[{ label: t('examples.design_0079'), value: 'design' }, { label: t('examples.development_0080'), value: 'code' }, { label: t('examples.research_0081'), value: 'research' }]" option-label="label" option-value="value" display="chip" :aria-label="t('examples.areas_0082')" v-bind="preview" />
  </div>
</template>
