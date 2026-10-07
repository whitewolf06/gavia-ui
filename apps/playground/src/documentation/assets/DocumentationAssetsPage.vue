<script setup lang="ts">
import type { WlThemeName } from "../../../../../packages/ui-kit/src";
import { documentationAssetPages, type DocumentationAssetSection } from "./assets";
import IconsDocumentation from "./IconsDocumentation.vue";
import ColorsDocumentation from "./ColorsDocumentation.vue";

defineProps<{ section: DocumentationAssetSection; theme: WlThemeName }>();
</script>

<template>
  <article class="docs-assets-page wl-stack" data-space="2xl" data-testid="docs-assets-page" :data-docs-section="section" :data-docs-theme="theme">
    <IconsDocumentation v-if="section === 'icons'" />
    <ColorsDocumentation v-else :theme="theme" />
  </article>
</template>

<style>
.docs-assets-page { min-width: 0; }
.docs-assets-anchor { scroll-margin-top: var(--wl-space-lg); }
.docs-assets-link { color: var(--wl-accent); text-underline-offset: 3px; }
.docs-assets-link:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
</style>
