<script setup lang="ts">
import { wlSpacing } from "../../../../../../packages/ui-kit/src";
</script>

<template>
  <dl class="spacing-example wl-stack" data-space="md">
    <div v-for="(token, name) in wlSpacing" :key="name" class="spacing-example-row">
      <dt><code class="wl-text-code">{{ name }}</code></dt>
      <dd class="spacing-example-bar" :style="{ width: 'var(' + token + ')' }" aria-hidden="true" />
      <dd class="spacing-example-token"><code class="wl-text-code">{{ token }}</code></dd>
    </div>
  </dl>
</template>

<style scoped>
.spacing-example { margin: 0; }
.spacing-example-row { display: grid; grid-template-columns: 40px 64px minmax(0, 1fr); align-items: center; gap: var(--wl-space-sm); }
.spacing-example-row dd { margin: 0; }
.spacing-example-bar { height: var(--wl-space-lg); background: var(--wl-accent); border-radius: var(--wl-corner-control); }
.spacing-example-token { overflow-wrap: anywhere; }
</style>
