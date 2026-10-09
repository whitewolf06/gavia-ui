<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSegmented } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const selected = ref<"list" | "grid" | "archive" | null>("list");
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSegmented v-model="selected" :options="[{ label: t('examples.list_0111'), value: 'list' }, { label: t('examples.grid_0112'), value: 'grid' }, { label: t('examples.archive_0113'), value: 'archive', disabled: true }]" :aria-label="t('examples.view_0114')" v-bind="preview" />
  </div>
</template>
