<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, type Component } from "vue";
import CodePanel from "../../design-system/CodePanel.vue";
import { consumerSource } from "../../design-system/code";
const props = defineProps<{ name: string; title: string; example: Component; source: string }>();
const consumerCode = computed(() => consumerSource(props.source));
</script>

<template>
  <section class="docs-asset-example wl-stack" data-space="lg" :data-asset-example="name">
    <h3 class="wl-text-subheading">{{ title }}</h3>
    <div class="docs-asset-preview" data-testid="docs-asset-preview" role="region" :aria-label="title + t('documentation.strings.s0001')"><component :is="example" /></div>
    <div data-testid="docs-asset-source"><CodePanel :source="consumerCode" :title="t('documentation.strings.s0002')" :expanded="true" /></div>
  </section>
</template>

<style>
.docs-asset-example { min-width: 0; }
.docs-asset-preview { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); color: var(--wl-text); overflow-wrap: anywhere; }
</style>
