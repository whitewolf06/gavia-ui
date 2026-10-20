<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { DocumentationGuideSection } from "../navigation";
import CodePanel from "../design-system/CodePanel.vue";
import { playgroundLocale } from "../i18n";
import { documentationGuide } from "./guides";
const props = defineProps<{ section: DocumentationGuideSection }>();
const guide = computed(() => documentationGuide(props.section, playgroundLocale.value));
const RecipeGallery = defineAsyncComponent(() => import("../design-system/RecipeGallery.vue"));
</script>

<template>
  <div class="wl-stack" data-space="xl" :data-guide="section">
    <section
      v-for="(entry, index) in guide.sections"
      :key="entry.title"
      class="wl-stack"
      data-space="md"
    >
      <h2 :id="`guide-${section}-${index}`" class="wl-text-heading">{{ entry.title }}</h2>
      <p class="wl-text-body">{{ entry.text }}</p>
      <CodePanel v-if="entry.code" :source="entry.code" :expanded="true" />
    </section>
    <RecipeGallery v-if="section === 'recipes'" />
    <a v-if="section === 'accessibility'" class="docs-text-link" href="https://www.w3.org/WAI/ARIA/apg/patterns/">WAI-ARIA Authoring Practices</a>
    <a class="docs-text-link" :href="`https://github.com/whitewolf06/gavia-ui/tree/main/${section === 'why' ? 'examples' : section === 'theming' ? 'docs/guide/theming.md' : section === 'accessibility' ? 'docs/maintainers/quality.md' : 'docs/architecture.md'}`">{{ playgroundLocale === 'ru' ? 'Исходники и руководство' : 'Source and guide' }}</a>
  </div>
</template>
