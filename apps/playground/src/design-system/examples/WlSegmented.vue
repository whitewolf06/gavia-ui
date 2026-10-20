<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlSegmented } from "gavia-ui";
import { computed, ref } from "vue";
const selected = ref<"list" | "grid" | "archive" | null>("list");
const options = computed(() => [
  { label: t("examples.list_0111"), value: "list" as const },
  { label: t("examples.grid_0112"), value: "grid" as const },
  { label: t("examples.archive_0113"), value: "archive" as const, disabled: true }
]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSegmented
      v-model="selected"
      size="sm"
      block
      :options="options"
      :aria-label="t('examples.view_0114')"
      v-bind="preview"
    />
  </div>
</template>
