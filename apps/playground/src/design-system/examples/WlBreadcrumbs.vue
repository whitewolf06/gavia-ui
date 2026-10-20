<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlBreadcrumbs } from "gavia-ui";
import { computed } from "vue";
const items = computed(() => [
  { key: "home", label: "Gavia UI", href: "#ds-components" },
  { key: "docs", label: t("examples.documentation_0340"), href: "#ds-components" },
  { key: "materials", label: t("examples.materials_0015"), href: "#ds-components" },
  { key: "design", label: t("examples.design_0079"), href: "#ds-components" },
  { key: "guide", label: t("examples.team_guide_0016") }
]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlBreadcrumbs
      :items="items"
      :max-items="3"
      separator="›"
      v-bind="preview"
    >
      <template #item="{ item }"><span>{{ item.label }}</span></template>
    </WlBreadcrumbs>
  </div>
</template>
