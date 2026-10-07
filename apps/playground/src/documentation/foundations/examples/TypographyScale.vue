<script setup lang="ts">
import { wlTypography } from "../../../../../../packages/ui-kit/src";
</script>

<template>
  <dl class="typography-example wl-stack" data-space="lg">
    <div v-for="role in wlTypography" :key="role.name" class="typography-example-role">
      <dt class="wl-stack" data-space="xs">
        <code class="wl-text-code">{{ 'wl-text-' + role.name }}</code>
        <span class="wl-text-small wl-text-muted">{{ role.description }}</span>
      </dt>
      <dd><p :class="'wl-text-' + role.name">{{ role.label }}</p></dd>
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
