<script setup lang="ts">
import { computed, type Component } from "vue";
import CodePanel from "../../design-system/CodePanel.vue";
import { consumerSource } from "../../design-system/code";

const props = defineProps<{ name: string; id: string; title: string; description: string; example: Component; source: string }>();
const consumerCode = computed(() => consumerSource(props.source));
</script>

<template>
  <section class="docs-foundation-example wl-stack" data-space="lg" :data-docs-example="name" :aria-labelledby="id">
    <div class="wl-stack" data-space="sm"><h2 :id="id" class="docs-foundation-anchor wl-text-heading">{{ title }}</h2><p class="wl-text-body wl-text-muted">{{ description }}</p></div>
    <div class="docs-foundation-preview" data-testid="docs-foundation-preview" role="region" :aria-label="title + ' — живой пример'"><component :is="example" /></div>
    <div data-testid="docs-foundation-source"><CodePanel :source="consumerCode" title="Vue SFC · пример для приложения" :expanded="true" /></div>
  </section>
</template>

<style>
.docs-foundation-example { min-width: 0; }
.docs-foundation-preview { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); color: var(--wl-text); overflow-wrap: anywhere; }
</style>
