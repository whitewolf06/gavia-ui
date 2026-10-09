<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, wlBreakpoints } from "../../../../../packages/ui-kit/src";
import { documentationFoundationPages } from "../catalog";
import CodePanel from "../../design-system/CodePanel.vue";
import FoundationExample from "./FoundationExample.vue";
import ViewportLayout from "./examples/ViewportLayout.vue";
import viewportSource from "./examples/ViewportLayout.vue?raw";
import FluidGrid from "./examples/FluidGrid.vue";
import fluidSource from "./examples/FluidGrid.vue?raw";
import ContainerCard from "./examples/ContainerCard.vue";
import containerSource from "./examples/ContainerCard.vue?raw";
import MediaBehavior from "./examples/MediaBehavior.vue";
import behaviorSource from "./examples/MediaBehavior.vue?raw";
const emit = defineEmits<{ component: [name: string | undefined]; navigate: [view: "system" | "project" | "components"] }>();
const metadata = documentationFoundationPages.responsive;
const examples = [
  { ...metadata.examples[0]!, example: ViewportLayout, source: viewportSource },
  { ...metadata.examples[1]!, example: FluidGrid, source: fluidSource },
  { ...metadata.examples[2]!, example: ContainerCard, source: containerSource },
  { ...metadata.examples[3]!, example: MediaBehavior, source: behaviorSource }
];
const localCss = [
  '/* A local application layout; no global token mutation. */',
  '.project-page {',
  '  --wl-layout-page-max: 1440px;',
  '  --wl-layout-page-gutter: clamp(12px, 3vw, 32px);',
  '  --wl-layout-grid-min: 280px;',
  '  --wl-layout-grid-gap: var(--wl-space-lg);',
  '}',
  '.project-layout { display: grid; grid-template-columns: minmax(0, 1fr); }',
  '@media (min-width: 820px) {',
  '  .project-layout { grid-template-columns: 240px minmax(0, 1fr); }',
  '}'
].join("\n");
</script>

<template>
  <article class="docs-foundation-page wl-stack" data-space="2xl" data-testid="docs-foundation-page" data-docs-section="responsive">
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-rules">
      <h2 id="docs-responsive-rules" class="docs-foundation-anchor wl-text-heading">{{ metadata.rulesHeading.title }}</h2>
      <ul class="docs-foundation-rules"><li v-for="rule in metadata.rules" :key="rule">{{ rule }}</li></ul>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s1282') }} <code>gavia-ui/styles/primitives.css</code> {{ t('documentation.strings.s0724') }}</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-breakpoints">
      <h2 id="docs-responsive-breakpoints" class="docs-foundation-anchor wl-text-heading">{{ t('documentation.strings.s0184') }}</h2>
      <div class="docs-table-scroll" tabindex="0" role="region" :aria-label="t('documentation.strings.s0184')"><table class="docs-contract-table"><thead><tr><th scope="col">{{ t('documentation.strings.s0725') }}</th><th scope="col">{{ t('documentation.strings.s0726') }}</th><th scope="col">{{ t('documentation.strings.s0727') }}</th></tr></thead><tbody><tr v-for="(width, name) in wlBreakpoints" :key="name"><th scope="row"><code>{{ name }}</code></th><td>{{ width }} px</td><td>{{ name === 'sm' ? t('documentation.strings.s0728') : name === 'md' ? t('documentation.strings.s0729') : t('documentation.strings.s0730') }}</td></tr></tbody></table></div>
      <p class="wl-text-body"><code>wlBreakpoints</code> {{ t('documentation.strings.s0731') }} <code>packages/ui-kit/tokens/source.json</code>{{ t('documentation.strings.s0732') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0733') }} <code>var()</code> {{ t('documentation.strings.s0734') }} <code>@media</code> {{ t('documentation.strings.s0096') }} <code>@container</code>. <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties">CSS custom properties — MDN</a>.</p>
    </section>
    <FoundationExample v-for="sample in examples" :key="sample.name" v-bind="sample" />
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-overrides">
      <h2 id="docs-responsive-overrides" class="docs-foundation-anchor wl-text-heading">{{ t('documentation.strings.s0193') }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0735') }} <code>wl-grid</code> {{ t('documentation.strings.s0736') }} <code>data-space</code> {{ t('documentation.strings.s0737') }} <code>--wl-layout-grid-gap</code>{{ t('documentation.strings.s0738') }}</p>
      <CodePanel :source="localCss" language="css" :title="t('documentation.strings.s0739')" :expanded="true" />
      <p class="wl-text-body">{{ t('documentation.strings.s0740') }} <code>matchMedia</code>{{ t('documentation.strings.s0741') }} <code>container-type: inline-size</code>{{ t('documentation.strings.s0742') }} <code>@container</code> {{ t('documentation.strings.s0743') }} <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries">Container queries — MDN</a>.</p>
      <p class="wl-text-body">{{ t('documentation.strings.s0744') }} <code>tokens/source.json → breakpoints</code> {{ t('documentation.strings.s0745') }} <code>pnpm tokens:sync</code>{{ t('documentation.strings.s0746') }} <code>pnpm tokens:check</code>{{ t('documentation.strings.s0747') }} <code>@media</code> {{ t('documentation.strings.s0748') }}</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-components">
      <h2 id="docs-responsive-components" class="docs-foundation-anchor wl-text-heading">{{ t('documentation.strings.s0194') }}</h2>
      <div class="docs-table-scroll" tabindex="0" role="region" :aria-label="t('documentation.strings.s0749')"><table class="docs-contract-table"><thead><tr><th scope="col">{{ t('documentation.strings.s0750') }}</th><th scope="col">{{ t('documentation.strings.s0751') }}</th><th scope="col">{{ t('documentation.strings.s0752') }}</th></tr></thead><tbody><tr><th scope="row">WlPageHeader</th><td>{{ t('documentation.strings.s0753') }}</td><td>{{ t('documentation.strings.s0754') }}</td></tr><tr><th scope="row">WlFilterBar</th><td>{{ t('documentation.strings.s0753') }}</td><td>{{ t('documentation.strings.s0755') }}</td></tr><tr><th scope="row">WlSidebar</th><td>{{ t('documentation.strings.s0756') }}</td><td>{{ t('documentation.strings.s0757') }}</td></tr></tbody></table></div>
      <p class="wl-text-body">{{ t('documentation.strings.s0758') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0759') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0760') }} <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia">matchMedia</a> {{ t('documentation.strings.s0089') }} <a class="docs-text-link" href="https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event">{{ t('documentation.strings.s0761') }}</a>.</p>
    </section>
    <section class="wl-stack" data-space="md" aria-labelledby="docs-responsive-checks">
      <h2 id="docs-responsive-checks" class="docs-foundation-anchor wl-text-heading">{{ t('documentation.strings.s0195') }}</h2>
      <ul class="docs-foundation-rules"><li>{{ t('documentation.strings.s0762') }}</li><li>{{ t('documentation.strings.s0763') }}</li><li>{{ t('documentation.strings.s0764') }}</li><li>{{ t('documentation.strings.s0765') }}</li><li>{{ t('documentation.strings.s0766') }}</li></ul>
    </section>
    <footer class="docs-foundation-footer wl-stack" data-space="md"><h2 id="docs-responsive-next" class="docs-foundation-anchor wl-text-subheading">{{ t('documentation.strings.s0144') }}</h2><div class="wl-inline" data-space="sm"><WlButton size="sm" @click="emit('component', 'WlFilterBar')">WlFilterBar</WlButton><WlButton size="sm" @click="emit('component', 'WlSidebar')">WlSidebar</WlButton><WlButton size="sm" @click="emit('navigate', 'system')">{{ t('documentation.strings.s0722') }}</WlButton></div><a class="docs-text-link wl-text-small" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/responsiveness.md">{{ t('documentation.strings.s0767') }}</a></footer>
  </article>
</template>
