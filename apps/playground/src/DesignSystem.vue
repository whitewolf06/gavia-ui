<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";
const { t } = usePlaygroundI18n();
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import {
  resolveWlToken, wlSpacing,
  wlBreakpoints, type WlDesignTokenName, type WlDesignTokenDefinition
} from "../../../packages/ui-kit/src/design-system";
import { getLocalizedDesignTokens, getLocalizedDesignThemes, getLocalizedTypography, getLocalizedContrastReport } from "./design-system/localized-tokens";
const wlDesignTokens = getLocalizedDesignTokens();
const wlDesignThemes = getLocalizedDesignThemes();
const wlTypography = getLocalizedTypography();
const wlContrastReport = getLocalizedContrastReport();
import { getLocalizedManifest } from "./documentation/manifest";
const wlManifest = getLocalizedManifest();
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";
import type { WlThemeName, WlTableColumn } from "../../../packages/ui-kit/src/types";
import type { WlComponentManifest } from "../../../packages/ui-kit/src/manifest/types";
import ComponentExplorer from "./design-system/ComponentExplorer.vue";
import CodePanel from "./design-system/CodePanel.vue";
import RecipeGallery from "./design-system/RecipeGallery.vue";
import ContentStress from "./design-system/ContentStress.vue";
import PlaygroundPageHeader from "./PlaygroundPageHeader.vue";

const WlButton = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlButton.vue"));
const WlInput = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlInput.vue"));
const WlField = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlField.vue"));
const WlSelect = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSelect.vue"));
const WlSwitch = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSwitch.vue"));
const WlAlert = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlAlert.vue"));
const WlEmpty = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlEmpty.vue"));
const WlSkeleton = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSkeleton.vue"));
const WlSegmented = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSegmented.vue"));
const WlTable = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlTable.vue"));
const WlDrawer = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlDrawer.vue"));

const props = defineProps<{ theme: WlThemeName }>();
const emit = defineEmits<{ (event: "component", name: string): void }>();
const sections = [
  ["foundations", t('shell.DesignSystem.text141')], ["typography", t('shell.DesignSystem.text142')], ["layout", t('shell.DesignSystem.text143')],
  ["tokens", t('shell.DesignSystem.text144')], ["components", t('shell.DesignSystem.text145')], ["patterns", t('shell.DesignSystem.text146')],
  ["recipes", t('shell.DesignSystem.text147')], ["stress", t('shell.DesignSystem.text148')], ["accessibility", t('shell.DesignSystem.text149')]
] as const;
const themePreviewGroups = [
  { id: "gavia", themes: wlDesignThemes.filter((item) => item.name === "gavia" || item.name === "gavia-dark") },
  { id: "classic", themes: wlDesignThemes.filter((item) => item.name !== "gavia" && item.name !== "gavia-dark") }
];
const semanticColors = ["bg", "bg-soft", "text", "text-muted", "accent", "success", "warn", "danger"] as const;
const query = ref("");
const layer = ref("semantic");
const category = ref("all");
const layerOptions = [
  { label: t('shell.DesignSystem.text150'), value: "all" }, { label: "Foundation", value: "foundation" },
  { label: "Semantic", value: "semantic" }, { label: "Component", value: "component" }
];
const categories = [...new Set(wlDesignTokens.map((token) => token.category))].sort();
const categoryOptions = [{ label: t('shell.DesignSystem.text151'), value: "all" }, ...categories.map((value) => ({ label: value, value }))];
const tokenRows = computed(() => {
  const needle = query.value.toLowerCase().trim();
  return wlDesignTokens.filter((token) => (layer.value === "all" || token.layer === layer.value)
    && (category.value === "all" || token.category === category.value))
    .map((token) => ({ ...token, value: (token as WlDesignTokenDefinition).themes?.[props.theme] ?? token.value, resolved: resolveWlToken(token.name, props.theme) }))
    .filter((token) => !needle || `${token.name} ${token.description} ${token.value} ${token.resolved}`.toLowerCase().includes(needle));
});
const selectedComponent = ref("WlButton");
const contract = computed(() => wlManifest.find((entry) => entry.name === selectedComponent.value) as WlComponentManifest);
const componentOptions = wlManifest.map((entry) => ({ label: entry.name, value: entry.name }));
const name = ref("");
const email = ref("");
const submitted = ref(false);
const saved = ref(false);
watch([name, email], () => { saved.value = false; });
const nameError = computed(() => submitted.value && !name.value.trim() ? t('shell.DesignSystem.text152') : "");
const emailError = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? t('shell.DesignSystem.text153') : "");
async function submitForm(): Promise<void> {
  submitted.value = true;
  saved.value = false;
  if (nameError.value || emailError.value) {
    await nextTick();
    document.getElementById(nameError.value ? "ds-name" : "ds-email")?.focus();
    return;
  }
  saved.value = true;
}
const contentState = ref<string | null>("ready");
const stateOptions = [
  { label: t('shell.DesignSystem.text154'), value: "ready" }, { label: t('shell.DesignSystem.text155'), value: "loading" },
  { label: t('shell.DesignSystem.text156'), value: "empty" }, { label: t('shell.DesignSystem.text157'), value: "error" }
];
const columns: WlTableColumn<{ name: string; status: string }>[] = [{ key: "name", label: t('shell.DesignSystem.text158') }, { key: "status", label: t('shell.DesignSystem.text159') }];
const rows = [{ name: t('shell.DesignSystem.text160'), status: t('shell.DesignSystem.text161') }, { name: t('shell.DesignSystem.text162'), status: t('shell.DesignSystem.text163') }, { name: t('shell.DesignSystem.text164'), status: t('shell.DesignSystem.text165') }];
const drawerVisible = ref(false);
const motion = ref(true);
const themeContrast = computed(() => wlContrastReport.filter((pair) => pair.theme === props.theme));
const resolved = (name: WlDesignTokenName, theme = props.theme): string => resolveWlToken(name, theme);
const layoutCode = t('shell.DesignSystem.text166');
const tokenCode = t('shell.DesignSystem.text167');
</script>

<template>
  <main class="ds-main wl-container" id="ds-top">
    <PlaygroundPageHeader class="ds-hero" :title="t('shell.DesignSystem.text168')"
      :description="t('shell.DesignSystem.text169')"
      :breadcrumbs="[{ label: t('shell.DesignSystem.text170') }]">
      <template #meta><div class="ds-metrics wl-inline" data-space="xl">
        <span><strong>{{ wlManifest.length }}</strong> {{ t('shell.DesignSystem.text171') }}</span>
        <span><strong>{{ wlDesignTokens.length }}</strong> {{ t('shell.DesignSystem.text172') }}</span>
        <span><strong>{{ WL_ICON_NAMES.length }}</strong> {{ t('shell.DesignSystem.text173') }}</span>
        <span><strong>{{ wlDesignThemes.length }}</strong> {{ t('shell.DesignSystem.text174') }}</span>
      </div></template>
    </PlaygroundPageHeader>
    <div class="ds-shell">
      <nav class="ds-nav" :aria-label="t('shell.DesignSystem.text175')">
        <a v-for="[id, label] in sections" :key="id" :href="`#ds-${id}`">{{ label }}</a>
      </nav>
      <div class="ds-content wl-stack" data-space="4xl">
        <section id="ds-foundations" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm">
            <p class="ds-eyebrow">{{ t('shell.DesignSystem.text176') }}</p>
            <h2 class="wl-text-title">{{ t('shell.DesignSystem.text177') }}</h2>
            <p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text178') }}</p>
          </div>
          <div class="wl-grid" data-space="lg">
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text179') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text180') }}</p></article>
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text181') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text182') }}</p></article>
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text183') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text184') }}</p></article>
          </div>
          <div class="wl-stack ds-theme-groups" data-space="2xl">
            <div v-for="group in themePreviewGroups" :key="group.id" class="wl-grid ds-theme-grid" :class="{ 'ds-theme-grid--gavia': group.id === 'gavia' }" :data-theme-group="group.id" data-space="lg">
              <article v-for="item in group.themes" :key="item.name" :data-wl-theme="item.name" class="wl-surface wl-stack ds-theme-preview" data-space="md">
                <h3 class="wl-text-heading">{{ item.label }}</h3>
                <p class="wl-text-small wl-text-muted">{{ item.description }}</p>
                <div class="ds-palette">
                  <span v-for="color in semanticColors" :key="color" class="ds-color" :title="`--wl-${color}: ${resolved(`--wl-${color}`, item.name)}`" :style="{ background: `var(--wl-${color})` }" />
                </div>
                <WlButton variant="primary" size="sm">{{ t('shell.DesignSystem.text185') }}</WlButton>
              </article>
            </div>
          </div>
          <div class="wl-grid" data-space="lg">
            <article class="wl-surface ds-elevation" :style="{ boxShadow: 'var(--wl-elevation-surface)' }"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text186') }}</h3><p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text187') }}</p></article>
            <article class="wl-surface ds-elevation" :style="{ boxShadow: 'var(--wl-elevation-floating)' }"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text188') }}</h3><p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text189') }}</p></article>
          </div>
        </section>

        <section id="ds-typography" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text190') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text191') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text192') }}</p></div>
          <div class="wl-surface ds-type-list">
            <div v-for="role in wlTypography" :key="role.name" class="ds-type-row">
              <div><code class="wl-text-code">{{ role.name }}</code><p class="wl-text-small wl-text-muted">{{ resolved(role.fontSize) }} / {{ resolved(role.lineHeight) }} · {{ resolved(role.fontWeight) }}</p></div>
              <div><p :class="`wl-text-${role.name}`">{{ role.label }}</p><p class="wl-text-small wl-text-muted">{{ role.description }}</p></div>
            </div>
          </div>
          <p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text193') }}</p>
        </section>

        <section id="ds-layout" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text194') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text195') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text196') }}</p></div>
          <div class="wl-surface ds-spacing">
            <div v-for="(token, space) in wlSpacing" :key="space" class="ds-space-row">
              <code class="wl-text-code">{{ space }}</code><span class="ds-space-bar" :style="{ width: `var(${token})` }" /><span class="wl-text-small wl-text-muted">{{ resolved(token) }}</span>
            </div>
          </div>
          <div class="wl-grid" data-space="lg">
            <div class="wl-surface wl-stack" data-space="md"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text197') }}</h3><div class="wl-grid" data-space="sm"><div class="ds-grid-cell">{{ t('shell.DesignSystem.text198') }}</div><div class="ds-grid-cell">{{ t('shell.DesignSystem.text199') }}</div></div><p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text200') }} {{ resolved('--wl-layout-page-max') }}.</p></div>
            <CodePanel :source="layoutCode" language="html" :title="t('shell.DesignSystem.text201')" :expanded="true" />
          </div>
          <div class="wl-inline wl-text-small wl-text-muted" data-space="lg"><span v-for="(width, key) in wlBreakpoints" :key="key">{{ key }}: {{ width }} px</span></div>
          <p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text202') }}</p>
        </section>

        <section id="ds-tokens" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text203') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text204') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text205') }} {{ theme }}.</p></div>
          <CodePanel :source="tokenCode" language="css" :title="t('shell.DesignSystem.text206')" :expanded="true" />
          <div class="ds-token-filters wl-grid" data-space="md">
            <WlField :label="t('shell.DesignSystem.text207')" id="ds-token-search" v-slot="field"><WlInput :id="field.id" v-model="query" :placeholder="t('shell.DesignSystem.text208')" type="search" /></WlField>
            <div class="wl-stack" data-space="sm"><span id="ds-token-layer-label" class="wl-text-label">{{ t('shell.DesignSystem.text209') }}</span><WlSelect id="ds-token-layer" v-model="layer" aria-labelledby="ds-token-layer-label" :options="layerOptions" option-label="label" option-value="value" /></div>
            <div class="wl-stack" data-space="sm"><span id="ds-token-category-label" class="wl-text-label">{{ t('shell.DesignSystem.text210') }}</span><WlSelect id="ds-token-category" v-model="category" aria-labelledby="ds-token-category-label" :options="categoryOptions" option-label="label" option-value="value" /></div>
          </div>
          <p class="wl-text-small wl-text-muted" role="status">{{ t('shell.DesignSystem.text211') }} <strong data-testid="ds-token-count">{{ tokenRows.length }}</strong> / {{ wlDesignTokens.length }}</p>
          <div class="ds-table-scroll ds-token-catalog" tabindex="0" role="region" :aria-label="t('shell.DesignSystem.text212')">
            <table class="ds-token-table">
              <thead><tr><th scope="col">{{ t('shell.DesignSystem.text213') }}</th><th scope="col">{{ t('shell.DesignSystem.text214') }}</th><th scope="col">{{ t('shell.DesignSystem.text215') }}</th></tr></thead>
              <tbody><tr v-for="token in tokenRows" :key="token.name" :data-token="token.name">
                <th scope="row"><code>{{ token.name }}</code><p class="wl-text-small wl-text-muted">{{ token.description }}</p><span class="ds-token-layer">{{ token.layer }}</span></th>
                <td><code>{{ token.value }}</code></td>
                <td><span v-if="token.type === 'color'" class="ds-value-color" :style="{ background: token.resolved }" /><code>{{ token.resolved }}</code></td>
              </tr></tbody>
            </table>
            <p v-if="!tokenRows.length" class="ds-no-results wl-text-body">{{ t('shell.DesignSystem.text216') }}</p>
          </div>
        </section>

        <section id="ds-components" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text217') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text218') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text219') }}</p></div>
          <div class="wl-surface wl-stack" data-space="lg">
            <div class="wl-inline" data-space="sm"><WlButton variant="primary">{{ t('shell.DesignSystem.text220') }}</WlButton><WlButton variant="secondary">{{ t('shell.DesignSystem.text221') }}</WlButton><WlButton variant="ghost">Ghost</WlButton><WlButton variant="danger">{{ t('shell.DesignSystem.text222') }}</WlButton></div>
            <div class="wl-inline" data-space="sm"><WlButton size="sm">{{ t('shell.DesignSystem.text223') }}</WlButton><WlButton size="md">{{ t('shell.DesignSystem.text224') }}</WlButton><WlButton size="lg">{{ t('shell.DesignSystem.text225') }}</WlButton><WlButton density="compact">{{ t('shell.DesignSystem.text226') }}</WlButton></div>
            <div class="wl-inline" data-space="sm"><WlButton disabled>{{ t('shell.DesignSystem.text227') }}</WlButton><WlButton loading>{{ t('shell.DesignSystem.text228') }}</WlButton><WlField :label="t('shell.DesignSystem.text229')" id="ds-state-invalid" :error="t('shell.DesignSystem.text230')" v-slot="field"><WlInput :id="field.id" :model-value="t('shell.DesignSystem.text231')" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" /></WlField></div>
            <p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text232') }}</p>
          </div>
          <WlField :label="t('shell.DesignSystem.text233')" id="ds-component-picker" v-slot="field"><WlSelect :id="field.id" :aria-label="t('shell.DesignSystem.text234')" v-model="selectedComponent" :options="componentOptions" option-label="label" option-value="value" /></WlField>
          <article class="wl-surface wl-stack" data-space="lg" data-testid="ds-contract">
            <div class="wl-inline" data-space="sm"><h3 class="wl-text-heading">{{ contract.name }}</h3><span class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text235') }} {{ contract.introducedIn }}</span><WlButton size="sm" @click="emit('component', contract.name)">{{ t('shell.DesignSystem.text236') }}</WlButton></div>
            <p class="wl-text-body wl-text-muted">{{ contract.description }}</p>
            <div v-if="contract.model" class="ds-contract-model wl-text-code">v-model{{ contract.model.name === 'modelValue' ? '' : `:${contract.model.name}` }}: {{ contract.model.type }}</div>
            <div class="ds-table-scroll" tabindex="0" role="region" :aria-label="`Props ${contract.name}`"><table class="ds-token-table"><thead><tr><th scope="col">Prop</th><th scope="col">{{ t('shell.DesignSystem.text237') }}</th><th scope="col">{{ t('shell.DesignSystem.text238') }}</th></tr></thead><tbody><tr v-for="prop in contract.props" :key="prop.name"><th scope="row"><code>{{ prop.name }}{{ prop.required ? ' *' : '' }}</code></th><td><code>{{ prop.values?.join(' | ') ?? prop.type }}</code></td><td class="wl-text-small">{{ prop.description }}<p v-if="prop.default !== undefined" class="wl-text-muted">{{ t('shell.DesignSystem.text239') }} {{ JSON.stringify(prop.default) }}</p></td></tr></tbody></table></div>
            <div class="wl-grid" data-space="lg"><div><h4 class="wl-text-label">{{ t('shell.DesignSystem.text240') }}</h4><ul class="ds-list wl-text-small"><li v-for="slot in contract.slots" :key="slot.name"><code>{{ slot.name }}</code> — {{ slot.description }}</li><li v-if="!contract.slots.length">{{ t('shell.DesignSystem.text241') }}</li></ul></div><div><h4 class="wl-text-label">{{ t('shell.DesignSystem.text242') }}</h4><ul class="ds-list wl-text-small"><li v-for="event in contract.emits" :key="event.name"><code>{{ event.name }}</code> — {{ event.payload ?? event.description }}</li><li v-if="!contract.emits.length">{{ t('shell.DesignSystem.text243') }}</li></ul></div></div>
            <ComponentExplorer :entry="contract" />
          </article>
        </section>

        <section id="ds-patterns" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text244') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text245') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text246') }}</p></div>
          <div class="wl-grid" data-space="xl">
            <form class="wl-surface wl-stack" data-space="lg" novalidate @submit.prevent="submitForm" :aria-label="t('shell.DesignSystem.text247')">
              <h3 class="wl-text-heading">{{ t('shell.DesignSystem.text248') }}</h3>
              <WlField :label="t('shell.DesignSystem.text249')" id="ds-name" required :error="nameError" :hint="t('shell.DesignSystem.text250')" v-slot="field"><WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" required autocomplete="name" /></WlField>
              <WlField label="Email" id="ds-email" required :error="emailError" :hint="t('shell.DesignSystem.text251')" v-slot="field"><WlInput :id="field.id" v-model="email" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" type="email" required autocomplete="email" /></WlField>
              <WlButton variant="primary" type="submit">{{ t('shell.DesignSystem.text252') }}</WlButton>
              <WlAlert v-if="saved" variant="ok" :title="t('shell.DesignSystem.text253')">{{ t('shell.DesignSystem.text254') }}</WlAlert>
            </form>
            <article class="wl-surface wl-stack" data-space="lg"><h3 class="wl-text-heading">{{ t('shell.DesignSystem.text255') }}</h3><ol class="ds-list wl-text-body wl-text-muted"><li>{{ t('shell.DesignSystem.text256') }}</li><li>{{ t('shell.DesignSystem.text257') }}</li><li>{{ t('shell.DesignSystem.text258') }}</li><li>{{ t('shell.DesignSystem.text259') }}</li><li>{{ t('shell.DesignSystem.text260') }}</li></ol><p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text261') }}</p></article>
          </div>
          <article class="wl-surface wl-stack" data-space="lg">
            <h3 class="wl-text-heading">{{ t('shell.DesignSystem.text262') }}</h3>
            <WlSegmented v-model="contentState" :options="stateOptions" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" :aria-label="t('shell.DesignSystem.text263')" />
            <div class="ds-data-preview" data-testid="ds-data-state">
              <div v-if="contentState === 'loading'" class="wl-stack" data-space="lg" role="status" aria-busy="true"><span class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text264') }}</span><WlSkeleton height="20px" /><WlSkeleton height="20px" width="80%" /><WlSkeleton height="20px" width="60%" /></div>
              <WlEmpty v-else-if="contentState === 'empty'" icon="file" :title="t('shell.DesignSystem.text265')" :description="t('shell.DesignSystem.text266')"><template #action><WlButton @click="contentState = 'ready'">{{ t('shell.DesignSystem.text267') }}</WlButton></template></WlEmpty>
              <WlAlert v-else-if="contentState === 'error'" variant="err" :title="t('shell.DesignSystem.text268')">{{ t('shell.DesignSystem.text269') }}<template #action><WlButton size="sm" @click="contentState = 'ready'">{{ t('shell.DesignSystem.text270') }}</WlButton></template></WlAlert>
              <WlTable v-else :columns="columns" :value="rows" />
            </div>
          </article>
          <article class="wl-surface wl-stack" data-space="lg"><h3 class="wl-text-heading">{{ t('shell.DesignSystem.text271') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text272') }}</p><div class="wl-inline wl-text-body" data-space="sm"><WlSwitch v-model="motion" :aria-label="t('shell.DesignSystem.text273')">{{ t('shell.DesignSystem.text274') }}</WlSwitch></div><div><WlButton @click="drawerVisible = true">{{ t('shell.DesignSystem.text275') }}</WlButton></div></article>
        </section>

        <section id="ds-recipes" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text276') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text277') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text278') }}</p></div>
          <RecipeGallery />
        </section>
        <section id="ds-stress" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text279') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text280') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text281') }}</p></div>
          <ContentStress />
        </section>
        <section id="ds-accessibility" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">{{ t('shell.DesignSystem.text282') }}</p><h2 class="wl-text-title">{{ t('shell.DesignSystem.text283') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text284') }}</p></div>
          <div class="wl-grid" data-space="lg"><article class="wl-surface"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text285') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text286') }}</p></article><article class="wl-surface"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text287') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text288') }}</p></article><article class="wl-surface"><h3 class="wl-text-subheading">{{ t('shell.DesignSystem.text289') }}</h3><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text290') }}</p></article></div>
          <div class="ds-table-scroll" tabindex="0" role="region" :aria-label="t('shell.DesignSystem.text291')"><table class="ds-token-table"><thead><tr><th scope="col">{{ t('shell.DesignSystem.text292') }} {{ theme }}</th><th scope="col">{{ t('shell.DesignSystem.text293') }}</th><th scope="col">{{ t('shell.DesignSystem.text294') }}</th></tr></thead><tbody><tr v-for="pair in themeContrast" :key="pair.name"><th scope="row">{{ pair.label }}</th><td class="ds-contrast-pass">{{ pair.ratio }}:1</td><td>{{ pair.minimum }}:1</td></tr></tbody></table></div>
          <p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text295') }}</p>
        </section>
        <footer class="ds-footer wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text296') }}</footer>
      </div>
    </div>
    <WlDrawer v-model:visible="drawerVisible" :header="t('shell.DesignSystem.text297')" :motion="motion">
      <div class="wl-stack" data-space="lg"><h2 class="wl-text-heading">{{ t('shell.DesignSystem.text298') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.DesignSystem.text299') }}</p><p class="wl-text-small wl-text-muted">{{ t('shell.DesignSystem.text300') }} {{ resolved('--wl-motion-slow') }} · easing: {{ resolved('--wl-motion-ease') }}</p></div>
      <template #footer><WlButton variant="primary" @click="drawerVisible = false">{{ t('shell.DesignSystem.text301') }}</WlButton></template>
    </WlDrawer>
  </main>
</template>

<style>
.ds-main { padding-block: var(--wl-space-2xl) var(--wl-space-4xl); }
.ds-hero { margin-bottom: var(--wl-space-2xl); }
.ds-eyebrow { font-family: var(--wl-mono); font-size: 11px; line-height: 18px; letter-spacing: .08em; text-transform: uppercase; color: var(--wl-text-muted); }
.ds-metrics { color: var(--wl-text-muted); font-size: 12px; }
.ds-metrics strong { color: var(--wl-text); font-size: 18px; margin-right: 4px; }
.ds-shell { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: var(--wl-space-2xl); }
.ds-nav { position: sticky; top: 84px; align-self: start; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid var(--wl-border); padding-left: var(--wl-space-md); }
.ds-nav a { color: var(--wl-text-muted); font-size: 13px; padding: 8px; text-decoration: none; border-radius: var(--wl-radius-sm); }
.ds-nav a:hover { color: var(--wl-text); background: var(--wl-bg-soft); }
.ds-nav a:focus-visible, .ds-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.ds-content { min-width: 0; }
.ds-section { scroll-margin-top: 90px; }
.ds-section > div:first-child > p:last-child { max-width: 72ch; }
.ds-theme-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ds-theme-grid--gavia { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ds-theme-preview { padding: var(--wl-space-lg); }
.ds-palette { display: flex; flex-wrap: wrap; gap: 4px; }
.ds-color { width: 21px; height: 21px; border: 1px solid var(--wl-border); border-radius: 50%; }
.ds-theme-preview .wl-btn { align-self: start; }
.ds-elevation { min-height: 110px; display: flex; flex-direction: column; justify-content: center; gap: var(--wl-space-sm); }
.ds-type-list { padding-block: 0; }
.ds-type-row { display: grid; grid-template-columns: 145px minmax(0, 1fr); gap: var(--wl-space-lg); padding-block: var(--wl-space-lg); align-items: baseline; }
.ds-type-row + .ds-type-row { border-top: 1px solid var(--wl-border); }
.ds-type-row p { overflow-wrap: anywhere; }
.ds-type-row code { color: var(--wl-text-accent); }
.ds-spacing { display: grid; gap: var(--wl-space-md); }
.ds-space-row { display: grid; grid-template-columns: 42px 80px 1fr; gap: var(--wl-space-lg); align-items: center; }
.ds-space-bar { height: 14px; background: var(--wl-accent); border-radius: 2px; }
.ds-grid-cell { padding: var(--wl-space-lg); border: 1px dashed var(--wl-accent-border); background: var(--wl-accent-soft); border-radius: var(--wl-radius-sm); color: var(--wl-text); font-size: 12px; }
.ds-token-filters { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
.ds-table-scroll { overflow: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); max-width: 100%; }
.ds-token-catalog { max-height: 560px; }
.ds-token-catalog thead { position: sticky; top: 0; z-index: 1; }
.ds-token-table { border-collapse: collapse; width: 100%; font-size: 12px; line-height: 18px; text-align: left; }
.ds-token-table th, .ds-token-table td { padding: 12px 16px; vertical-align: top; border-bottom: 1px solid var(--wl-border); }
.ds-token-table thead { background: var(--wl-bg-soft); }
.ds-token-table tbody th { min-width: 230px; font-weight: 500; }
.ds-token-table td { min-width: 155px; }
.ds-token-table code { font-family: var(--wl-mono); font-size: 11px; overflow-wrap: anywhere; }
.ds-token-table tbody tr:last-child > * { border-bottom: 0; }
.ds-token-layer { color: var(--wl-text-muted); font-size: 10px; }
.ds-value-color { display: inline-block; width: 12px; height: 12px; border: 1px solid var(--wl-border); border-radius: 3px; margin-right: 6px; vertical-align: middle; }
.ds-no-results { padding: var(--wl-space-xl); }
.ds-contract-model { padding: var(--wl-space-md); background: var(--wl-bg-soft); border-radius: var(--wl-radius-sm); }
.ds-list { padding-left: 20px; margin-top: var(--wl-space-sm); }
.ds-list li + li { margin-top: var(--wl-space-sm); }
.ds-data-preview { min-height: 180px; overflow-x: auto; }
.ds-contrast-pass { color: var(--wl-ok-text); font-weight: 600; }
.ds-footer { padding-top: var(--wl-space-lg); border-top: 1px solid var(--wl-border); }
@media (max-width: 900px) {
  .ds-shell { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-xl); }
  .ds-nav { position: static; flex-direction: row; flex-wrap: wrap; border-left: 0; padding-left: 0; border-bottom: 1px solid var(--wl-border); padding-bottom: var(--wl-space-md); }
}
@media (max-width: 640px) {
  .ds-theme-grid, .ds-theme-grid--gavia, .ds-token-filters { grid-template-columns: minmax(0, 1fr); }
  .ds-type-row { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-sm); }
  .ds-section { scroll-margin-top: 145px; }
}
@media (max-width: 760px) { .ds-main { padding-top: var(--wl-space-xl); } }
</style>
