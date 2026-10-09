<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCommandPalette, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(false);
const query = ref('');
const selected = ref('');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">{{ t("examples.open_commands_0030") }}</WlButton><WlCommandPalette v-model:visible="visible" v-model:query="query" :aria-label="t('examples.material_commands_0031')" :groups="[{ id: 'actions', label: t('examples.actions_0032'), showWhenEmpty: true, items: [{ id: 'edit', label: t('examples.edit_0033'), icon: 'edit' }, { id: 'archive', label: t('examples.archive_0034'), icon: 'folder', disabled: true }] }]" v-bind="preview" @select="selected = $event.label" /><p v-if="selected" role="status">{{ selected }}</p>
  </div>
</template>
