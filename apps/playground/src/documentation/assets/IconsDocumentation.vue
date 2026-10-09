<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WL_ICON_NAMES, WlButton, WlIcon, WlInput, type WlIconName } from "../../../../../packages/ui-kit/src";
import CodePanel from "../../design-system/CodePanel.vue";
import { consumerSource } from "../../design-system/code";
import AssetExample from "./AssetExample.vue";
import { iconDocumentationHeadings as headings } from "./assets";
import IconPlayground from "./examples/IconPlayground.vue";
import playgroundSource from "./examples/IconPlayground.vue?raw";
import IconAccessibility from "./examples/IconAccessibility.vue";
import accessibilitySource from "./examples/IconAccessibility.vue?raw";
import IconCompatibility from "./examples/IconCompatibility.vue";
import compatibilitySource from "./examples/IconCompatibility.vue?raw";

const selectedName = ref<WlIconName>("folder");
const selectedSize = ref(24);
const query = ref("");
const matchingNames = computed(() => WL_ICON_NAMES.filter((name) => name.includes(query.value.trim().toLowerCase())));
const code = consumerSource(playgroundSource);
</script>

<template>
  <div class="docs-icons wl-stack" data-space="2xl">
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.playground.id" data-asset-example="icon-playground">
      <h2 :id="headings.playground.id" class="docs-assets-anchor wl-text-heading">{{ headings.playground.title }}</h2>
      <p class="wl-text-body wl-text-muted">{{ t('documentation.strings.s0044') }}</p>
      <div class="docs-asset-preview" data-testid="docs-asset-preview"><IconPlayground v-model:name="selectedName" v-model:size="selectedSize" /></div>
      <div data-testid="docs-asset-source"><CodePanel :source="code" :title="t('documentation.strings.s0045')" :expanded="true" /></div>
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.catalog.id">
      <h2 :id="headings.catalog.id" class="docs-assets-anchor wl-text-heading">{{ headings.catalog.title }}</h2>
      <div class="docs-icons-search wl-stack" data-space="sm"><label for="docs-icon-search" class="wl-text-label">{{ t('documentation.strings.s0046') }}</label><WlInput id="docs-icon-search" v-model="query" :placeholder="t('documentation.strings.s0047')" /><p class="wl-text-small wl-text-muted" role="status" data-testid="docs-icon-count">{{ t('documentation.strings.s0048') }} {{ matchingNames.length }} / {{ WL_ICON_NAMES.length }} {{ t('documentation.strings.s0049') }} {{ selectedName }} {{ t('documentation.strings.s0050') }} {{ selectedSize }} px</p></div>
      <ul class="docs-icons-grid" :aria-label="t('documentation.strings.s0051')" data-testid="docs-icon-catalog">
        <li v-for="name in matchingNames" :key="name"><button type="button" class="docs-icon-choice" :data-icon-name="name" :aria-label="t('documentation.strings.s0052') + name" :aria-pressed="selectedName === name" @click="selectedName = name"><WlIcon :name="name" :size="selectedSize" /><code class="wl-text-code">{{ name }}</code></button></li>
      </ul>
      <p v-if="!matchingNames.length" class="wl-text-body">{{ t('documentation.strings.s0053') }}</p>
      <div><WlButton v-if="query" size="sm" variant="ghost" @click="query = ''">{{ t('documentation.strings.s0054') }}</WlButton></div>
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.accessibility.id">
      <h2 :id="headings.accessibility.id" class="docs-assets-anchor wl-text-heading">{{ headings.accessibility.title }}</h2>
      <ul class="docs-icons-rules"><li>{{ t('documentation.strings.s0055') }}</li><li>{{ t('documentation.strings.s0056') }}</li><li>{{ t('documentation.strings.s0057') }}</li></ul>
      <AssetExample name="icon-accessibility" :title="t('documentation.strings.s0058')" :example="IconAccessibility" :source="accessibilitySource" />
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.compatibility.id">
      <h2 :id="headings.compatibility.id" class="docs-assets-anchor wl-text-heading">{{ headings.compatibility.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0059') }}</p>
      <AssetExample name="icon-compatibility" :title="t('documentation.strings.s0060')" :example="IconCompatibility" :source="compatibilitySource" />
    </section>
    <section class="wl-stack" data-space="md" :aria-labelledby="headings.pipeline.id">
      <h2 :id="headings.pipeline.id" class="docs-assets-anchor wl-text-heading">{{ headings.pipeline.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0061') }} <code>pnpm icons:sync</code> {{ t('documentation.strings.s0062') }} <code>pnpm icons:check</code> {{ t('documentation.strings.s0063') }}</p>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0064') }}</p>
      <a class="docs-assets-link" href="https://github.com/whitewolf06/gavia-ui/blob/main/docs/icons.md">{{ t('documentation.strings.s0065') }}</a>
    </section>
  </div>
</template>

<style>
.docs-icons { min-width: 0; }
.docs-icons-search { max-width: 420px; }
.docs-icons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 112px), 1fr)); gap: var(--wl-space-sm); margin: 0; padding: 0; list-style: none; }
.docs-icons-grid li { min-width: 0; }
.docs-icon-choice { width: 100%; min-width: 0; min-height: 104px; padding: var(--wl-space-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--wl-space-md); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); color: var(--wl-text); cursor: pointer; }
.docs-icon-choice code { font-size: var(--wl-type-small-size); overflow-wrap: anywhere; }
.docs-icon-choice:hover { background: var(--wl-bg-soft); }
.docs-icon-choice[aria-pressed="true"] { border-color: var(--wl-accent); background: var(--wl-accent-soft); }
.docs-icon-choice:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.docs-icons-rules { display: grid; gap: var(--wl-space-md); margin: 0; padding-left: var(--wl-space-lg); font-size: var(--wl-type-body-size); line-height: var(--wl-type-body-line-height); }
</style>
