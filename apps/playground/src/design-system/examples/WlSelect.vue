<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSelect } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>('team');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSelect v-model="value" :options="[{ label: t('examples.team_0086'), value: 'team' }, { label: t('examples.personal_0115'), value: 'personal' }]" option-label="label" option-value="value" :aria-label="t('examples.scope_0116')" v-bind="preview" />
  </div>
</template>
