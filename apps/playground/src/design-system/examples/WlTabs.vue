<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlTabs } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref('example-overview');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTabs v-model="active" :items="[{ key: 'example-overview', label: t('examples.overview_0000') }, { key: 'example-history', label: t('examples.history_0133'), count: 3 }]" v-bind="preview"><template #panel="{ item }"><p class="wl-text-body">{{ item.key === 'example-overview' ? t("examples.material_description_0134") : t("examples.material_updated_october_1_0135") }}</p></template></WlTabs>
  </div>
</template>
