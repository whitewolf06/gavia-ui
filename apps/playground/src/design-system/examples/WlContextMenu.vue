<script setup lang="ts">
import { WlCard, WlContextMenu, type WlMenuItem } from "gavia-ui";
import { computed, ref } from "vue";
import { usePlaygroundI18n } from "../../i18n";

defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
const selection = ref("");
const compact = ref(false);
const items = computed<WlMenuItem[]>(() => [
  { label: t("examples.edit_0033"), icon: "edit", command: () => { selection.value = t("examples.editing_0075"); } },
  { label: t("examples.view_0114"), items: [
    { label: t("examples.compact_header_0505"), type: "checkbox", checked: compact.value, onCheckedChange: (checked) => { compact.value = checked; } }
  ] },
  { label: t("examples.unavailable_0076"), disabled: true },
  { separator: true },
  { label: t("examples.delete_0037"), icon: "trash", danger: true, command: () => { selection.value = t("examples.deletion_0077"); } }
]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlContextMenu
      :items="items"
      :aria-label="t('examples.material_actions_0078')"
      data-context-example
      v-bind="preview"
    >
      <WlCard padding="md"><p>{{ t("examples.material_0074") }} · Shift+F10</p></WlCard>
    </WlContextMenu>
    <p role="status" class="wl-text-small">{{ selection }} · {{ t("examples.compact_header_0505") }}: {{ compact }}</p>
  </div>
</template>
