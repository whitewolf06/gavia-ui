<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlMenu } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selection = ref(t("examples.choose_an_action_0073"));
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMenu :items="[{ header: t('examples.material_0074') }, { key: 'edit', label: t('examples.edit_0033'), icon: 'edit', command: () => selection = t('examples.editing_0075') }, { key: 'lock', label: t('examples.unavailable_0076'), disabled: true }, { separator: true }, { key: 'delete', label: t('examples.delete_0037'), icon: 'trash', danger: true, command: () => selection = t('examples.deletion_0077') }]" :aria-label="t('examples.material_actions_0078')" v-bind="preview" /><p role="status" class="wl-text-small">{{ selection }}</p>
  </div>
</template>
