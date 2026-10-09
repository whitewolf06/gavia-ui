<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, type Component } from "vue";
import { WlButton, wlBreakpoints, resolveWlToken } from "../../../../../packages/ui-kit/src";
import type { DocumentationFoundationSection } from "../../navigation";
import { documentationFoundationPages } from "../catalog";
import FoundationExample from "./FoundationExample.vue";
import ResponsiveDocumentation from "./ResponsiveDocumentation.vue";
import TypographyScale from "./examples/TypographyScale.vue";
import typographySource from "./examples/TypographyScale.vue?raw";
import TextHierarchy from "./examples/TextHierarchy.vue";
import hierarchySource from "./examples/TextHierarchy.vue?raw";
import Containers from "./examples/Containers.vue";
import containersSource from "./examples/Containers.vue?raw";
import EqualColumns from "./examples/EqualColumns.vue";
import equalColumnsSource from "./examples/EqualColumns.vue?raw";
import ColumnProportions from "./examples/ColumnProportions.vue";
import proportionsSource from "./examples/ColumnProportions.vue?raw";
import ResponsiveGrid from "./examples/ResponsiveGrid.vue";
import gridSource from "./examples/ResponsiveGrid.vue?raw";
import GridGapAlignment from "./examples/GridGapAlignment.vue";
import alignmentSource from "./examples/GridGapAlignment.vue?raw";
import NestedGrid from "./examples/NestedGrid.vue";
import nestedSource from "./examples/NestedGrid.vue?raw";
import PageComposition from "./examples/PageComposition.vue";
import compositionSource from "./examples/PageComposition.vue?raw";
import Spacing from "./examples/Spacing.vue";
import spacingSource from "./examples/Spacing.vue?raw";
import CssHelpers from "./examples/CssHelpers.vue";
import helpersSource from "./examples/CssHelpers.vue?raw";
import StackingLayers from "./examples/StackingLayers.vue";
import layersSource from "./examples/StackingLayers.vue?raw";
import ContentWriting from "./examples/ContentWriting.vue";
import writingSource from "./examples/ContentWriting.vue?raw";
import ContentStates from "./examples/ContentStates.vue";
import statesSource from "./examples/ContentStates.vue?raw";

const props = defineProps<{ section: DocumentationFoundationSection }>();
const emit = defineEmits<{
  component: [name: string | undefined];
  navigate: [view: "system" | "project" | "components"];
}>();
const metadata = computed(() => documentationFoundationPages[props.section]);
const implementations: Record<string, { example: Component; source: string }> = {
  "typography-scale": { example: TypographyScale, source: typographySource },
  "text-hierarchy": { example: TextHierarchy, source: hierarchySource },
  containers: { example: Containers, source: containersSource },
  "equal-columns": { example: EqualColumns, source: equalColumnsSource },
  "column-proportions": { example: ColumnProportions, source: proportionsSource },
  "responsive-grid": { example: ResponsiveGrid, source: gridSource },
  "gap-alignment": { example: GridGapAlignment, source: alignmentSource },
  "nested-grid": { example: NestedGrid, source: nestedSource },
  "page-composition": { example: PageComposition, source: compositionSource },
  spacing: { example: Spacing, source: spacingSource },
  "css-helpers": { example: CssHelpers, source: helpersSource },
  "stacking-layers": { example: StackingLayers, source: layersSource },
  "content-writing": { example: ContentWriting, source: writingSource },
  "content-states": { example: ContentStates, source: statesSource }
};
const examples = computed(() => metadata.value.examples.map((sample) => {
  const implementation = implementations[sample.name];
  if (!implementation) throw new Error("Missing documentation example: " + sample.name);
  return { ...sample, ...implementation };
}));
const layers = [
  { name: t('documentation.strings.s0697'), token: "--wl-layer-base", purpose: t('documentation.strings.s0698') },
  { name: "Sticky", token: "--wl-layer-sticky", purpose: t('documentation.strings.s0699') },
  { name: "Sidebar", token: "--wl-layer-navigation", purpose: t('documentation.strings.s0700') },
  { name: t('documentation.strings.s0701'), token: "--wl-layer-mask", purpose: t('documentation.strings.s0702') },
  { name: "Popover", token: "--wl-layer-popover", purpose: t('documentation.strings.s0703') },
  { name: t('documentation.strings.s0704'), token: "--wl-layer-navigation-modal", purpose: t('documentation.strings.s0705') },
  { name: "Command palette", token: "--wl-layer-command", purpose: t('documentation.strings.s0706') },
  { name: t('documentation.strings.s0707'), token: "--wl-layer-filter", purpose: t('documentation.strings.s0708') },
  { name: "Toast", token: "--wl-layer-toast", purpose: t('documentation.strings.s0709') }
] as const;
</script>

<template>
  <ResponsiveDocumentation v-if="section === 'responsive'" @component="emit('component', $event)" @navigate="emit('navigate', $event)" />
  <article v-else class="docs-foundation-page wl-stack" data-space="2xl" data-testid="docs-foundation-page" :data-docs-section="section">
    <section class="wl-stack" data-space="md" :aria-labelledby="metadata.rulesHeading.id">
      <h2 :id="metadata.rulesHeading.id" class="docs-foundation-anchor wl-text-heading">{{ metadata.rulesHeading.title }}</h2>
      <ul class="docs-foundation-rules"><li v-for="rule in metadata.rules" :key="rule">{{ rule }}</li></ul>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s1282') }} <code>gavia-ui/styles/primitives.css</code> {{ t('documentation.strings.s0710') }}</p>
    </section>
    <section v-if="metadata.breakpointsHeading" class="docs-foundation-breakpoints wl-stack" data-space="sm" :aria-labelledby="metadata.breakpointsHeading.id">
      <h2 :id="metadata.breakpointsHeading.id" class="docs-foundation-anchor wl-text-subheading">{{ metadata.breakpointsHeading.title }}</h2>
      <div class="wl-inline" data-space="lg"><code v-for="(width, name) in wlBreakpoints" :key="name" class="wl-text-code">{{ name }}: {{ width }} px</code></div>
      <p class="wl-text-body">{{ t('documentation.strings.s0711') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0712') }}</p>
    </section>
    <FoundationExample v-for="sample in examples" :key="sample.name" v-bind="sample" />
    <section v-if="metadata.layersHeading" class="wl-stack" data-space="md" :aria-labelledby="metadata.layersHeading.id">
      <h2 :id="metadata.layersHeading.id" class="docs-foundation-anchor wl-text-heading">{{ metadata.layersHeading.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0713') }} <code>--wl-layer-sticky</code>{{ t('documentation.strings.s0714') }} <code>wl-isolate</code>.</p>
      <div class="docs-table-scroll" tabindex="0" role="region" :aria-label="t('documentation.strings.s0715')">
        <table class="docs-contract-table"><thead><tr><th scope="col">{{ t('documentation.strings.s0716') }}</th><th scope="col">{{ t('documentation.strings.s0717') }}</th><th scope="col">{{ t('documentation.strings.s0718') }}</th><th scope="col">{{ t('documentation.strings.s0677') }}</th></tr></thead><tbody><tr v-for="layer in layers" :key="layer.token"><th scope="row">{{ layer.name }}</th><td><code>{{ layer.token }}</code></td><td>{{ resolveWlToken(layer.token) }}</td><td>{{ layer.purpose }}</td></tr></tbody></table>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0719') }}</p>
    </section>
    <footer class="docs-foundation-footer wl-stack" data-space="md">
      <h2 :id="metadata.continueHeading.id" class="docs-foundation-anchor wl-text-subheading">{{ metadata.continueHeading.title }}</h2>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('component', undefined)">{{ t('documentation.strings.s0720') }}</WlButton><WlButton size="sm" @click="emit('navigate', 'components')">{{ t('documentation.strings.s0721') }}</WlButton><WlButton size="sm" variant="ghost" @click="emit('navigate', 'system')">{{ t('documentation.strings.s0722') }}</WlButton></div>
      <a class="docs-text-link wl-text-small" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md">{{ t('documentation.strings.s0723') }}</a>
    </footer>
  </article>
</template>

<style>
.docs-foundation-page { min-width: 0; }
.docs-foundation-anchor { scroll-margin-top: var(--wl-space-lg); }
.docs-foundation-rules { display: grid; gap: var(--wl-space-md); padding-left: var(--wl-space-lg); margin: 0; font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
.docs-foundation-breakpoints { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.docs-foundation-footer { padding-top: var(--wl-space-xl); border-top: 1px solid var(--wl-border); }
</style>
