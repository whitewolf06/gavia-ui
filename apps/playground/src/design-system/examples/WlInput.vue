<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlInput, WlIcon } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref(t("examples.team_material_0071"));
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlInput v-model="value" :aria-label="t('examples.material_title_0056')" :placeholder="t('examples.title_0072')" :pt="{ input: { 'data-example': 'material-title' } }" v-bind="preview"><template #prefix><WlIcon name="file" /></template></WlInput>
  </div>
</template>
