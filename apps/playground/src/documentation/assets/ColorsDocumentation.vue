<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { translateDocumentationText } from "../localize";
import { computed, ref } from "vue";
import { WlButton, wlDesignThemes, wlDesignTokens, resolveWlToken, type WlThemeName } from "../../../../../packages/ui-kit/src";
import CodePanel from "../../design-system/CodePanel.vue";
import AssetExample from "./AssetExample.vue";
import { colorDocumentationHeadings as headings, documentationColorGroups } from "./assets";
import ColorRoles from "./examples/ColorRoles.vue";
import rolesSource from "./examples/ColorRoles.vue?raw";
import ColorStates from "./examples/ColorStates.vue";
import statesSource from "./examples/ColorStates.vue?raw";

const props = defineProps<{ theme: WlThemeName }>();
const semanticTokens = new Map(wlDesignTokens.filter((token) => token.layer === "semantic" && token.type === "color").map((token) => [token.name, token]));
const currentTheme = computed(() => wlDesignThemes.find((theme) => theme.name === props.theme));
const groups = computed(() => documentationColorGroups.map((group) => ({
  ...group,
  heading: headings[group.key],
  tokens: group.tokens.map((name) => {
    const definition = semanticTokens.get(name);
    if (!definition) throw new Error("Missing semantic colour token: " + name);
    return { ...definition, description: translateDocumentationText(definition.description), variable: "var(" + name + ")", resolved: resolveWlToken(name, props.theme) };
  })
})));
const tokenCount = computed(() => groups.value.reduce((count, group) => count + group.tokens.length, 0));
const setupCode = computed(() => [
  'import { createApp } from "vue";',
  'import "gavia-ui/styles/reset.css";',
  'import "gavia-ui/styles/base.css";',
  'import "gavia-ui/styles/primitives.css";',
  ...((props.theme === "gavia" || props.theme === "gavia-dark") ? ['import "gavia-ui/styles/fonts/gavia.css";'] : []),
  'import "gavia-ui/themes/' + props.theme + '.css";',
  'import App from "./App.vue";',
  "",
  'document.documentElement.dataset.wlTheme = "' + props.theme + '";',
  'createApp(App).mount("#app");'
].join("\n"));
const feedback = ref<{ token: string; value: string; message: string; failed: boolean } | null>(null);
const pendingToken = ref<string | null>(null);
let copyRequest = 0;
async function copyToken(token: string, value: string): Promise<void> {
  const request = ++copyRequest;
  pendingToken.value = token;
  feedback.value = null;
  try {
    await navigator.clipboard.writeText(value);
    if (request === copyRequest) feedback.value = { token, value, message: t('documentation.strings.s0025') + value, failed: false };
  } catch {
    if (request === copyRequest) feedback.value = { token, value, message: t('documentation.strings.s0026'), failed: true };
  } finally {
    if (request === copyRequest) pendingToken.value = null;
  }
}
</script>

<template>
  <div class="docs-colors wl-stack" data-space="2xl">
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.themes.id">
      <h2 :id="headings.themes.id" class="docs-assets-anchor wl-text-heading">{{ headings.themes.title }}</h2>
      <p class="wl-text-body" data-testid="docs-color-theme">{{ t('documentation.strings.s0027') }} {{ currentTheme?.label ?? theme }}{{ t('documentation.strings.s0028') }}</p>
      <div class="docs-theme-grid">
        <article v-for="definition in wlDesignThemes" :key="definition.name" class="docs-theme-preview wl-stack" data-space="md" :data-wl-theme="definition.name" :data-asset-theme="definition.name">
          <h3 class="wl-text-subheading">{{ definition.label }}</h3><p class="wl-text-small wl-text-muted">{{ translateDocumentationText(definition.description) }}</p>
          <div class="docs-theme-accent wl-text-label">{{ t('documentation.strings.s0029') }}</div>
          <p class="wl-text-code">bg: {{ resolveWlToken('--wl-bg', definition.name) }}</p><p class="wl-text-code">text: {{ resolveWlToken('--wl-text', definition.name) }}</p>
        </article>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t('documentation.strings.s0030') }}</p>
    </section>
    <section class="wl-stack" data-space="lg" :aria-labelledby="headings.setup.id">
      <h2 :id="headings.setup.id" class="docs-assets-anchor wl-text-heading">{{ headings.setup.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0031') }}</p>
      <div data-testid="docs-color-setup"><CodePanel :source="setupCode" :title="t('documentation.strings.s0032')" language="ts" :expanded="true" /></div>
    </section>
    <p class="wl-text-small wl-text-muted" data-testid="docs-color-count">{{ t('documentation.strings.s0033') }} {{ tokenCount }}{{ t('documentation.strings.s0034') }}</p>
    <section v-for="group in groups" :key="group.key" class="wl-stack" data-space="lg" :aria-labelledby="group.heading.id" :data-color-group="group.key">
      <h2 :id="group.heading.id" class="docs-assets-anchor wl-text-heading">{{ group.heading.title }}</h2><p class="wl-text-body wl-text-muted">{{ group.description }}</p>
      <div class="docs-color-grid">
        <article v-for="token in group.tokens" :key="token.name" class="docs-color-card wl-stack" data-space="md" :data-color-token="token.name" :data-resolved-value="token.resolved">
          <div class="docs-color-swatch" aria-hidden="true"><span :style="{ backgroundColor: token.resolved }" /></div>
          <code class="wl-text-code">{{ token.variable }}</code><p class="wl-text-small wl-text-muted">{{ token.description }}</p>
          <dl class="docs-color-values"><div><dt>{{ t('documentation.strings.s0035') }}</dt><dd><code data-testid="docs-color-resolved">{{ token.resolved }}</code></dd></div><div><dt>{{ t('documentation.strings.s0036') }}</dt><dd><code>{{ token.value }}</code></dd></div></dl>
          <div class="wl-inline" data-space="xs"><WlButton size="sm" variant="ghost" :disabled="pendingToken === token.name" :aria-label="t('documentation.strings.s0037') + token.name" @click="copyToken(token.name, token.variable)">{{ t('documentation.strings.s0038') }}</WlButton><WlButton size="sm" variant="ghost" :disabled="pendingToken === token.name" :aria-label="t('documentation.strings.s0039') + token.name" @click="copyToken(token.name, token.resolved)">{{ t('documentation.strings.s0035') }}</WlButton></div>
          <p v-if="feedback?.token === token.name" class="wl-text-small" :role="feedback.failed ? 'alert' : 'status'">{{ feedback.message }}</p>
          <textarea v-if="feedback?.token === token.name && feedback.failed" class="docs-color-manual" readonly :aria-label="t('documentation.strings.s0040') + token.name" :value="feedback.value" @focus="($event.target as HTMLTextAreaElement).select()" />
        </article>
      </div>
    </section>
    <section class="wl-stack" data-space="xl" :aria-labelledby="headings.examples.id">
      <h2 :id="headings.examples.id" class="docs-assets-anchor wl-text-heading">{{ headings.examples.title }}</h2>
      <p class="wl-text-body">{{ t('documentation.strings.s0041') }}</p>
      <AssetExample name="color-roles" :title="t('documentation.strings.s0042')" :example="ColorRoles" :source="rolesSource" />
      <AssetExample name="color-states" :title="t('documentation.strings.s0043')" :example="ColorStates" :source="statesSource" />
    </section>
  </div>
</template>

<style>
.docs-colors { min-width: 0; }
.docs-theme-grid, .docs-color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--wl-space-lg); }
.docs-theme-preview { min-width: 0; padding: var(--wl-space-lg); background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.docs-theme-accent { padding: var(--wl-space-sm) var(--wl-space-md); border-radius: var(--wl-corner-control); background: var(--wl-action-primary-bg); color: var(--wl-action-primary-text); }
.docs-color-card { min-width: 0; padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg); }
.docs-color-swatch { height: 48px; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); overflow: hidden; background: repeating-conic-gradient(var(--wl-border) 0% 25%, var(--wl-bg) 0% 50%) 50% / 12px 12px; }
.docs-color-swatch span { display: block; width: 100%; height: 100%; }
.docs-color-values { margin: 0; display: grid; gap: var(--wl-space-sm); font-size: var(--wl-type-small-size); }
.docs-color-values div { display: grid; gap: var(--wl-space-xs); }
.docs-color-values dt { color: var(--wl-text-muted); }
.docs-color-values dd { margin: 0; overflow-wrap: anywhere; }
.docs-color-card code, .docs-theme-preview code { overflow-wrap: anywhere; white-space: normal; }
.docs-color-manual { width: 100%; min-width: 0; min-height: 64px; padding: var(--wl-space-sm); background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); font: var(--wl-type-small-size)/1.5 var(--wl-mono); }
.docs-color-manual:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
</style>
