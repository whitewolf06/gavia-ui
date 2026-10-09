<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";
const { t } = usePlaygroundI18n();
import { computed, onMounted, ref, watch } from "vue";
import { WlAlert, WlButton, WlCheckbox, WlIcon, WlInput, WlSelect, WlSwitch, WlTag } from "../../../packages/ui-kit/src";
import type { WlThemeName } from "../../../packages/ui-kit/src/types";
import { isPlaygroundTheme, playgroundThemeOptions } from "./themes";
import CodePanel from "./design-system/CodePanel.vue";
import PlaygroundPageHeader from "./PlaygroundPageHeader.vue";
import { createThemeExport, createThemeOverrides, createThemePalette, getThemeContrast, normalizeHex, parseThemeDraft, isThemeNameValid, THEME_DRAFT_SCHEMA_VERSION, themePaletteFields, type ThemePalette } from "./theme-builder/palette";

const props = defineProps<{ theme: WlThemeName }>();
const storageKey = "gavia-ui.theme-builder.v1";
const baseTheme = ref<WlThemeName>(props.theme);
const name = ref("my-gavia");
const palette = ref<ThemePalette>(createThemePalette(baseTheme.value));
const hexDrafts = ref<ThemePalette>({ ...palette.value });
const nameInvalid = computed(() => !isThemeNameValid(name.value));
const hexInvalid = computed(() => themePaletteFields.some((field) => !normalizeHex(hexDrafts.value[field.key])));
const overrides = computed(() => createThemeOverrides(palette.value, baseTheme.value));
const contrast = computed(() => getThemeContrast(palette.value, baseTheme.value));
const failedContrast = computed(() => contrast.value.filter((pair) => !pair.passes).length);
const themeExport = computed(() => createThemeExport(nameInvalid.value ? "my-theme" : name.value, baseTheme.value, palette.value));
const exportPanel = ref<InstanceType<typeof CodePanel> | null>(null);
const exportMode = ref<"prompt" | "json" | "css">("prompt");
const exportOptions = [{ value: "prompt", label: t('shell.ThemeBuilderPage.text302') }, { value: "json", label: "JSON" }, { value: "css", label: "CSS" }] as const;
const exportSource = computed(() => themeExport.value[exportMode.value]);
const savedLocally = ref(false);
const storageUnavailable = ref(false);
let ready = false;

function setColor(key: keyof ThemePalette, raw: string): void {
  hexDrafts.value[key] = raw;
  const hex = normalizeHex(raw);
  if (hex) palette.value = { ...palette.value, [key]: hex };
}
function chooseBase(value: unknown): void {
  if (!isPlaygroundTheme(value)) return;
  baseTheme.value = value;
  resetPalette();
}
function resetPalette(): void {
  palette.value = createThemePalette(baseTheme.value);
  hexDrafts.value = { ...palette.value };
}
onMounted(() => {
  try {
    const stored = localStorage.getItem(storageKey);
    const draft = stored ? parseThemeDraft(JSON.parse(stored)) : null;
    if (draft) {
      name.value = draft.name;
      baseTheme.value = draft.baseTheme;
      palette.value = draft.palette;
      hexDrafts.value = { ...draft.palette };
      savedLocally.value = true;
    }
  } catch { storageUnavailable.value = true; }
  ready = true;
});
watch([name, baseTheme, palette], () => {
  if (!ready || nameInvalid.value) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: THEME_DRAFT_SCHEMA_VERSION, name: name.value, baseTheme: baseTheme.value, palette: palette.value }));
    savedLocally.value = true;
    storageUnavailable.value = false;
  } catch { storageUnavailable.value = true; }
}, { deep: true });

const title = ref(t('shell.ThemeBuilderPage.text303'));
const priority = ref<string | null>("normal");
const notifications = ref(true);
const publicProject = ref(false);
const actions = ref(0);
const demoDisabled = ref(false);
const demoInvalid = ref(false);
const previewOptions = [{ label: t('shell.ThemeBuilderPage.text304'), value: "normal" }, { label: t('shell.ThemeBuilderPage.text305'), value: "high" }, { label: t('shell.ThemeBuilderPage.text306'), value: "low" }];
const previewSelectPt = computed(() => ({ overlay: { "data-wl-theme": baseTheme.value, style: overrides.value, "data-testid": "theme-builder-overlay" } }));
</script>

<template>
  <main class="tb-page wl-container wl-stack" data-space="2xl" data-testid="theme-builder-page" aria-labelledby="tb-title">
    <PlaygroundPageHeader :title="t('shell.ThemeBuilderPage.text307')" title-id="tb-title"
      :description="t('shell.ThemeBuilderPage.text308')"
      :breadcrumbs="[{ label: t('shell.ThemeBuilderPage.text309') }]" />

    <div class="tb-workspace">
      <section class="tb-controls wl-stack" data-space="lg" aria-labelledby="tb-settings-title">
        <div class="tb-section-header">
          <h2 id="tb-settings-title" class="wl-text-subheading">{{ t('shell.ThemeBuilderPage.text310') }}</h2>
          <WlButton size="sm" variant="secondary" @click="resetPalette"><template #icon><WlIcon name="refresh" :size="14" /></template>{{ t('shell.ThemeBuilderPage.text311') }}</WlButton>
        </div>
        <div class="wl-stack" data-space="sm">
          <label id="tb-base-label" class="wl-text-label">{{ t('shell.ThemeBuilderPage.text312') }}</label>
          <WlSelect :model-value="baseTheme" :options="playgroundThemeOptions" option-label="label" option-value="value" aria-labelledby="tb-base-label" @update:model-value="chooseBase" />
          <p class="wl-text-small wl-text-muted">{{ t('shell.ThemeBuilderPage.text313') }}</p>
        </div>
        <div class="wl-stack" data-space="sm">
          <label for="tb-name" class="wl-text-label">{{ t('shell.ThemeBuilderPage.text314') }}</label>
          <WlInput id="tb-name" v-model="name" :invalid="nameInvalid" aria-describedby="tb-name-help" spellcheck="false" autocomplete="off" />
          <p id="tb-name-help" class="wl-text-small" :class="nameInvalid ? 'tb-error' : 'wl-text-muted'">{{ t('shell.ThemeBuilderPage.text315') }}</p>
        </div>
        <div class="tb-colors">
          <div v-for="field in themePaletteFields" :key="field.key" class="tb-color-field">
            <label :for="'tb-hex-' + field.key" class="wl-text-label">{{ field.label }}</label>
            <div class="tb-color-input">
              <input class="tb-native-color" type="color" :aria-label="t('shell.ThemeBuilderPage.text316') + field.label" :value="palette[field.key]" @input="setColor(field.key, ($event.target as HTMLInputElement).value)" />
              <WlInput :id="'tb-hex-' + field.key" :model-value="hexDrafts[field.key]" :invalid="!normalizeHex(hexDrafts[field.key])" :aria-describedby="'tb-help-' + field.key" spellcheck="false" autocomplete="off" @update:model-value="setColor(field.key, $event)" />
            </div>
            <p :id="'tb-help-' + field.key" class="wl-text-small" :class="!normalizeHex(hexDrafts[field.key]) ? 'tb-error' : 'wl-text-muted'">{{ !normalizeHex(hexDrafts[field.key]) ? t('shell.ThemeBuilderPage.text317') : field.description }}</p>
          </div>
        </div>
        <p class="wl-text-small wl-text-muted" role="status">{{ storageUnavailable ? t('shell.ThemeBuilderPage.text318') : savedLocally ? t('shell.ThemeBuilderPage.text319') : t('shell.ThemeBuilderPage.text320') }}</p>
      </section>

      <div class="tb-preview-column wl-stack" data-space="lg">
        <div class="tb-section-header">
          <div class="wl-stack" data-space="xs"><h2 id="tb-preview-title" class="wl-text-subheading">{{ t('shell.ThemeBuilderPage.text321') }}</h2><p class="wl-text-small wl-text-muted">{{ t('shell.ThemeBuilderPage.text322') }}</p></div>
          <span class="tb-base-tag wl-text-code">{{ baseTheme }}</span>
        </div>
        <div class="tb-preview-modes wl-inline" data-space="lg">
          <WlCheckbox v-model="demoDisabled">Disabled</WlCheckbox>
          <WlCheckbox v-model="demoInvalid">Invalid</WlCheckbox>
        </div>
        <section class="tb-preview wl-stack" data-space="lg" :data-wl-theme="baseTheme" :style="overrides" data-testid="theme-builder-preview" aria-labelledby="tb-preview-title">
          <div class="tb-demo-bar"><span class="tb-demo-brand"><WlIcon name="waves" :size="20" /> {{ nameInvalid ? t('shell.ThemeBuilderPage.text323') : name }}</span><a href="#tb-export-title">{{ t('shell.ThemeBuilderPage.text324') }} <WlIcon name="arrow-right" :size="14" /></a></div>
          <article class="tb-demo-card wl-stack" data-space="lg">
            <div class="tb-section-header"><div class="wl-stack" data-space="xs"><span class="tb-demo-eyebrow wl-text-small">{{ t('shell.ThemeBuilderPage.text325') }}</span><h3 class="wl-text-heading">{{ t('shell.ThemeBuilderPage.text326') }}</h3></div><WlTag variant="blue">{{ t('shell.ThemeBuilderPage.text327') }}</WlTag></div>
            <p class="wl-text-body wl-text-muted">{{ t('shell.ThemeBuilderPage.text328') }}</p>
            <div class="tb-demo-fields">
              <div class="wl-stack" data-space="sm"><label for="tb-demo-name" class="wl-text-label">{{ t('shell.ThemeBuilderPage.text329') }}</label><WlInput id="tb-demo-name" v-model="title" :disabled="demoDisabled" :invalid="demoInvalid" :aria-describedby="demoInvalid ? 'tb-demo-error' : undefined" /><span v-if="demoInvalid" id="tb-demo-error" class="tb-demo-error wl-text-small">{{ t('shell.ThemeBuilderPage.text330') }}</span></div>
              <div class="wl-stack" data-space="sm"><label id="tb-demo-priority-label" class="wl-text-label">{{ t('shell.ThemeBuilderPage.text331') }}</label><WlSelect v-model="priority" :options="previewOptions" option-label="label" option-value="value" :disabled="demoDisabled" :invalid="demoInvalid" :pt="previewSelectPt" aria-labelledby="tb-demo-priority-label" /></div>
            </div>
            <div class="tb-demo-checks wl-stack" data-space="md"><WlCheckbox v-model="notifications" :disabled="demoDisabled">{{ t('shell.ThemeBuilderPage.text332') }}</WlCheckbox><WlSwitch v-model="publicProject" :disabled="demoDisabled">{{ t('shell.ThemeBuilderPage.text333') }}</WlSwitch></div>
            <div class="wl-inline" data-space="md"><WlButton variant="primary" :disabled="demoDisabled" @click="actions++"><template #icon><WlIcon name="plus" :size="16" /></template>{{ t('shell.ThemeBuilderPage.text334') }}</WlButton><WlButton variant="secondary" :disabled="demoDisabled" @click="actions = 0">{{ t('shell.ThemeBuilderPage.text335') }}</WlButton></div>
            <p class="wl-text-small wl-text-muted" role="status">{{ t('shell.ThemeBuilderPage.text336') }} {{ actions }}</p>
          </article>
          <div class="tb-demo-soft wl-stack" data-space="md"><h3 class="wl-text-label">{{ t('shell.ThemeBuilderPage.text337') }}</h3><div class="wl-inline" data-space="sm"><WlButton variant="primary" size="sm" :disabled="demoDisabled">Primary</WlButton><WlButton variant="soft" size="sm" :disabled="demoDisabled">Soft</WlButton><WlButton variant="secondary" size="sm" :disabled="demoDisabled">Secondary</WlButton><WlButton variant="ghost" size="sm" :disabled="demoDisabled">Ghost</WlButton><WlButton variant="danger" size="sm" :disabled="demoDisabled">Danger</WlButton></div></div>
          <div class="wl-inline" data-space="sm"><WlTag variant="green">{{ t('shell.ThemeBuilderPage.text338') }}</WlTag><WlTag variant="amber">{{ t('shell.ThemeBuilderPage.text339') }}</WlTag><WlTag variant="red">{{ t('shell.ThemeBuilderPage.text340') }}</WlTag><WlTag variant="gray">{{ t('shell.ThemeBuilderPage.text341') }}</WlTag></div>
          <WlAlert variant="info" :title="t('shell.ThemeBuilderPage.text342')">{{ t('shell.ThemeBuilderPage.text343') }}</WlAlert>
        </section>
        <section class="tb-contrast wl-stack" data-space="md" aria-labelledby="tb-contrast-title">
          <div class="tb-section-header"><h2 id="tb-contrast-title" class="wl-text-subheading">{{ t('shell.ThemeBuilderPage.text344') }}</h2><span class="wl-text-small" :class="failedContrast ? 'tb-error' : 'wl-text-muted'">{{ failedContrast ? t('shell.ThemeBuilderPage.text345') + failedContrast : t('shell.ThemeBuilderPage.text346') }}</span></div>
          <ul class="tb-contrast-list"><li v-for="pair in contrast" :key="pair.key" :data-passes="pair.passes"><span>{{ pair.label }}</span><span class="tb-contrast-value"><WlIcon :name="pair.passes ? 'check-circle' : 'warn'" :size="14" />{{ pair.ratio.toFixed(2) }}:1 <span class="tb-contrast-min">/ {{ pair.minimum }}:1</span></span></li></ul>
          <p class="wl-text-small wl-text-muted">{{ t('shell.ThemeBuilderPage.text347') }}</p>
        </section>
      </div>
    </div>

    <section class="tb-export wl-stack" data-space="lg" aria-labelledby="tb-export-title">
      <div class="tb-section-header"><div class="wl-stack" data-space="sm"><h2 id="tb-export-title" class="wl-text-heading">{{ t('shell.ThemeBuilderPage.text348') }}</h2><p class="wl-text-body wl-text-muted">{{ t('shell.ThemeBuilderPage.text349') }}</p></div><WlButton variant="primary" :disabled="nameInvalid || hexInvalid" @click="exportPanel?.copy()"><template #icon><WlIcon name="copy" :size="16" /></template>{{ exportMode === 'prompt' ? t('shell.ThemeBuilderPage.text350') : t('shell.ThemeBuilderPage.text351') + exportMode.toUpperCase() }}</WlButton></div>
      <div class="wl-inline" data-space="sm" role="group" :aria-label="t('shell.ThemeBuilderPage.text352')"><WlButton v-for="option in exportOptions" :key="option.value" size="sm" :variant="exportMode === option.value ? 'soft' : 'secondary'" :aria-pressed="exportMode === option.value" @click="exportMode = option.value">{{ option.label }}</WlButton></div>
      <p v-if="nameInvalid || hexInvalid" class="tb-error wl-text-small" role="alert">{{ t('shell.ThemeBuilderPage.text353') }}</p>
      <div v-else data-testid="theme-builder-export"><CodePanel ref="exportPanel" :source="exportSource" :title="exportMode === 'prompt' ? t('shell.ThemeBuilderPage.text354') : exportMode === 'json' ? name + '.theme.json' : name + '.css'" :language="exportMode === 'css' ? 'css' : exportMode === 'json' ? 'json' : 'auto'" :expanded="true" /></div>
      <p class="wl-text-small wl-text-muted">{{ t('shell.ThemeBuilderPage.text355') }}</p>
    </section>
  </main>
</template>

<style scoped>
.tb-page { padding-block: var(--wl-space-2xl) var(--wl-space-4xl); overflow-wrap: anywhere; }
.tb-workspace { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); gap: var(--wl-space-2xl); align-items: start; }
.tb-controls { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.tb-section-header { display: flex; align-items: center; justify-content: space-between; gap: var(--wl-space-md); flex-wrap: wrap; }
.tb-colors { display: grid; gap: var(--wl-space-lg); }
.tb-color-field { display: grid; gap: var(--wl-space-sm); min-width: 0; }
.tb-color-input { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: var(--wl-space-sm); align-items: center; }
.tb-color-input :deep(input:not([type="color"])) { font-family: var(--wl-mono); }
.tb-native-color { display: block; width: 44px; height: var(--wl-control-height-md); padding: 4px; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); background: var(--wl-bg); cursor: pointer; }
.tb-native-color:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.tb-error { color: var(--wl-err-text); }
.tb-preview-column { min-width: 0; }
.tb-base-tag { padding: 4px 8px; border-radius: var(--wl-corner-control); background: var(--wl-bg-soft); color: var(--wl-text-muted); }
.tb-preview { padding: var(--wl-space-lg); color: var(--wl-text); background: var(--wl-bg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); min-width: 0; }
.tb-demo-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--wl-space-md); padding-bottom: var(--wl-space-lg); border-bottom: 1px solid var(--wl-border); }
.tb-demo-brand { display: inline-flex; gap: var(--wl-space-sm); align-items: center; font-weight: 600; }
.tb-demo-brand :deep(svg) { color: var(--wl-action-primary-bg); }
.tb-demo-bar a { display: inline-flex; align-items: center; gap: 6px; color: var(--wl-text-accent); text-underline-offset: 3px; }
.tb-demo-bar a:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 3px; }
.tb-demo-card { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-raised); }
.tb-demo-eyebrow { color: var(--wl-text-muted); }
.tb-demo-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, .6fr); gap: var(--wl-space-md); }
.tb-demo-error { color: var(--wl-err-text); }
.tb-demo-soft { padding: var(--wl-space-md); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.tb-contrast { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.tb-contrast-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--wl-space-sm) var(--wl-space-lg); padding: 0; list-style: none; }
.tb-contrast-list li { display: flex; gap: var(--wl-space-sm); align-items: start; justify-content: space-between; font-size: var(--wl-type-small-size); }
.tb-contrast-value { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; font-family: var(--wl-mono); }
.tb-contrast-min { color: var(--wl-text-muted); font-size: 10px; }
.tb-contrast-list [data-passes="false"] .tb-contrast-value { color: var(--wl-err-text); }
.tb-export { padding-top: var(--wl-space-xl); border-top: 1px solid var(--wl-border); scroll-margin-top: 100px; }
@media (max-width: 1000px) { .tb-workspace { grid-template-columns: minmax(240px, 300px) minmax(0, 1fr); gap: var(--wl-space-lg); } .tb-demo-fields { grid-template-columns: minmax(0, 1fr); } .tb-contrast-list { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 760px) { .tb-workspace { grid-template-columns: minmax(0, 1fr); } .tb-colors { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tb-page { padding-top: var(--wl-space-xl); } }
@media (max-width: 480px) { .tb-colors { grid-template-columns: minmax(0, 1fr); } .tb-controls, .tb-preview, .tb-demo-card, .tb-contrast { padding: var(--wl-space-md); } }
</style>
