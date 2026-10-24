<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlMenu, type WlMenuItem } from "gavia-ui";
import { computed, ref } from "vue";
const selection = ref(t("examples.choose_an_action_0073"));
const compact = ref(false);
const view = ref("list");
const items = computed<WlMenuItem[]>(() => [
  { header: t("examples.material_0074") },
  { key: "edit", label: t("examples.edit_0033"), icon: "edit", command: () => { selection.value = t("examples.editing_0075"); } },
  { key: "view", label: t("examples.view_0114"), items: [
    { key: "list", label: t("examples.list_0111"), type: "radio", group: t("examples.view_0114"), checked: view.value === "list", onCheckedChange: () => { view.value = "list"; } },
    { key: "grid", label: t("examples.grid_0112"), type: "radio", group: t("examples.view_0114"), checked: view.value === "grid", onCheckedChange: () => { view.value = "grid"; } },
    { separator: true },
    { key: "compact", label: t("examples.compact_header_0505"), type: "checkbox", checked: compact.value, onCheckedChange: (checked) => { compact.value = checked; } }
  ] },
  { key: "lock", label: t("examples.unavailable_0076"), disabled: true },
  { separator: true },
  { key: "delete", label: t("examples.delete_0037"), icon: "trash", danger: true, command: () => { selection.value = t("examples.deletion_0077"); } }
]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlMenu :items="items" :aria-label="t('examples.material_actions_0078')" v-bind="preview" />
    <p role="status" class="wl-text-small">{{ selection }} · {{ t("examples.view_0114") }}: {{ view }} · {{ compact }}</p>
  </div>
</template>
