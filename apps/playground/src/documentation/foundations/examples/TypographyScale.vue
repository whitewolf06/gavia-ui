<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { wlTypography } from "../../../../../../packages/ui-kit/src";
const roleText = {
  display: { label: t("examples.typography.display.label"), description: t("examples.typography.display.description") },
  title: { label: t("examples.typography.title.label"), description: t("examples.typography.title.description") },
  heading: { label: t("examples.typography.heading.label"), description: t("examples.typography.heading.description") },
  subheading: { label: t("examples.typography.subheading.label"), description: t("examples.typography.subheading.description") },
  body: { label: t("examples.typography.body.label"), description: t("examples.typography.body.description") },
  small: { label: t("examples.typography.small.label"), description: t("examples.typography.small.description") },
  label: { label: t("examples.typography.label.label"), description: t("examples.typography.label.description") },
  code: { label: t("examples.typography.code.label"), description: t("examples.typography.code.description") }
};
</script>

<template>
  <dl class="typography-example wl-stack" data-space="lg">
    <div v-for="role in wlTypography" :key="role.name" class="typography-example-role">
      <dt class="wl-stack" data-space="xs">
        <code class="wl-text-code">{{ 'wl-text-' + role.name }}</code>
        <span class="wl-text-small wl-text-muted">{{ roleText[role.name].description }}</span>
      </dt>
      <dd><p :class="'wl-text-' + role.name">{{ roleText[role.name].label }}</p></dd>
    </div>
  </dl>
</template>

<style scoped>
.typography-example { margin: 0; }
.typography-example-role { display: grid; grid-template-columns: minmax(0, 180px) minmax(0, 1fr); gap: var(--wl-space-lg); padding-bottom: var(--wl-space-lg); border-bottom: 1px solid var(--wl-border); overflow-wrap: anywhere; }
.typography-example-role:last-child { padding-bottom: 0; border-bottom: 0; }
.typography-example-role dd { min-width: 0; margin: 0; }
@media (max-width: 640px) { .typography-example-role { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-sm); } }
</style>
