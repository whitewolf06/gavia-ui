<script setup lang="ts">
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
const exportOptions = [{ value: "prompt", label: "Для агента" }, { value: "json", label: "JSON" }, { value: "css", label: "CSS" }] as const;
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

const title = ref("Новый проект");
const priority = ref<unknown>("normal");
const notifications = ref(true);
const publicProject = ref(false);
const actions = ref(0);
const demoDisabled = ref(false);
const demoInvalid = ref(false);
const previewOptions = [{ label: "Обычный", value: "normal" }, { label: "Высокий", value: "high" }, { label: "Низкий", value: "low" }];
const previewSelectPt = computed(() => ({ overlay: { "data-wl-theme": baseTheme.value, style: overrides.value, "data-testid": "theme-builder-overlay" } }));
</script>

<template>
  <main class="tb-page wl-container wl-stack" data-space="2xl" data-testid="theme-builder-page" aria-labelledby="tb-title">
    <PlaygroundPageHeader title="Подбор темы" title-id="tb-title"
      description="Выберите основу, измените ключевые цвета и попробуйте настоящие компоненты. Когда палитра готова, скопируйте настройки для агента или CSS для проекта."
      :breadcrumbs="[{ label: 'Подбор темы' }]" />

    <div class="tb-workspace">
      <section class="tb-controls wl-stack" data-space="lg" aria-labelledby="tb-settings-title">
        <div class="tb-section-header">
          <h2 id="tb-settings-title" class="wl-text-subheading">Цветовая схема</h2>
          <WlButton size="sm" variant="secondary" @click="resetPalette"><template #icon><WlIcon name="refresh" :size="14" /></template>Сбросить цвета</WlButton>
        </div>
        <div class="wl-stack" data-space="sm">
          <label id="tb-base-label" class="wl-text-label">Взять за основу</label>
          <WlSelect :model-value="baseTheme" :options="playgroundThemeOptions" option-label="label" option-value="value" aria-labelledby="tb-base-label" @update:model-value="chooseBase" />
          <p class="wl-text-small wl-text-muted">Выбор основы начинает новую палитру. Размеры, шрифты и статусные цвета наследуются из неё.</p>
        </div>
        <div class="wl-stack" data-space="sm">
          <label for="tb-name" class="wl-text-label">Имя темы</label>
          <WlInput id="tb-name" v-model="name" :invalid="nameInvalid" aria-describedby="tb-name-help" spellcheck="false" autocomplete="off" />
          <p id="tb-name-help" class="wl-text-small" :class="nameInvalid ? 'tb-error' : 'wl-text-muted'">Латинские строчные буквы, цифры и дефис, до 32 символов. Имя должно отличаться от готовых тем.</p>
        </div>
        <div class="tb-colors">
          <div v-for="field in themePaletteFields" :key="field.key" class="tb-color-field">
            <label :for="'tb-hex-' + field.key" class="wl-text-label">{{ field.label }}</label>
            <div class="tb-color-input">
              <input class="tb-native-color" type="color" :aria-label="'Выбрать цвет: ' + field.label" :value="palette[field.key]" @input="setColor(field.key, ($event.target as HTMLInputElement).value)" />
              <WlInput :id="'tb-hex-' + field.key" :model-value="hexDrafts[field.key]" :invalid="!normalizeHex(hexDrafts[field.key])" :aria-describedby="'tb-help-' + field.key" spellcheck="false" autocomplete="off" @update:model-value="setColor(field.key, $event)" />
            </div>
            <p :id="'tb-help-' + field.key" class="wl-text-small" :class="!normalizeHex(hexDrafts[field.key]) ? 'tb-error' : 'wl-text-muted'">{{ !normalizeHex(hexDrafts[field.key]) ? 'Укажите HEX: #rgb или #rrggbb. Пример сохраняет последний корректный цвет.' : field.description }}</p>
          </div>
        </div>
        <p class="wl-text-small wl-text-muted" role="status">{{ storageUnavailable ? 'Сохранение в браузере недоступно. Настройки можно скопировать ниже.' : savedLocally ? 'Черновик сохранён в этом браузере.' : 'Изменения сохраняются в этом браузере.' }}</p>
      </section>

      <div class="tb-preview-column wl-stack" data-space="lg">
        <div class="tb-section-header">
          <div class="wl-stack" data-space="xs"><h2 id="tb-preview-title" class="wl-text-subheading">Живой пример</h2><p class="wl-text-small wl-text-muted">Цвета применяются только к этому примеру.</p></div>
          <span class="tb-base-tag wl-text-code">{{ baseTheme }}</span>
        </div>
        <div class="tb-preview-modes wl-inline" data-space="lg">
          <WlCheckbox v-model="demoDisabled">Disabled</WlCheckbox>
          <WlCheckbox v-model="demoInvalid">Invalid</WlCheckbox>
        </div>
        <section class="tb-preview wl-stack" data-space="lg" :data-wl-theme="baseTheme" :style="overrides" data-testid="theme-builder-preview" aria-labelledby="tb-preview-title">
          <div class="tb-demo-bar"><span class="tb-demo-brand"><WlIcon name="waves" :size="20" /> {{ nameInvalid ? 'Моя тема' : name }}</span><a href="#tb-export-title">Настройки темы <WlIcon name="arrow-right" :size="14" /></a></div>
          <article class="tb-demo-card wl-stack" data-space="lg">
            <div class="tb-section-header"><div class="wl-stack" data-space="xs"><span class="tb-demo-eyebrow wl-text-small">Рабочее пространство</span><h3 class="wl-text-heading">Создайте что-нибудь хорошее</h3></div><WlTag variant="blue">Черновик</WlTag></div>
            <p class="wl-text-body wl-text-muted">Так будут сочетаться поверхности, текст и основной цвет в вашем приложении.</p>
            <div class="tb-demo-fields">
              <div class="wl-stack" data-space="sm"><label for="tb-demo-name" class="wl-text-label">Название проекта</label><WlInput id="tb-demo-name" v-model="title" :disabled="demoDisabled" :invalid="demoInvalid" :aria-describedby="demoInvalid ? 'tb-demo-error' : undefined" /><span v-if="demoInvalid" id="tb-demo-error" class="tb-demo-error wl-text-small">Проверьте название проекта.</span></div>
              <div class="wl-stack" data-space="sm"><label id="tb-demo-priority-label" class="wl-text-label">Приоритет</label><WlSelect v-model="priority" :options="previewOptions" option-label="label" option-value="value" :disabled="demoDisabled" :invalid="demoInvalid" :pt="previewSelectPt" aria-labelledby="tb-demo-priority-label" /></div>
            </div>
            <div class="tb-demo-checks wl-stack" data-space="md"><WlCheckbox v-model="notifications" :disabled="demoDisabled">Получать уведомления</WlCheckbox><WlSwitch v-model="publicProject" :disabled="demoDisabled">Публичный проект</WlSwitch></div>
            <div class="wl-inline" data-space="md"><WlButton variant="primary" :disabled="demoDisabled" @click="actions++"><template #icon><WlIcon name="plus" :size="16" /></template>Создать проект</WlButton><WlButton variant="secondary" :disabled="demoDisabled" @click="actions = 0">Сбросить действия</WlButton></div>
            <p class="wl-text-small wl-text-muted" role="status">Действий: {{ actions }}</p>
          </article>
          <div class="tb-demo-soft wl-stack" data-space="md"><h3 class="wl-text-label">Варианты действий</h3><div class="wl-inline" data-space="sm"><WlButton variant="primary" size="sm" :disabled="demoDisabled">Primary</WlButton><WlButton variant="soft" size="sm" :disabled="demoDisabled">Soft</WlButton><WlButton variant="secondary" size="sm" :disabled="demoDisabled">Secondary</WlButton><WlButton variant="ghost" size="sm" :disabled="demoDisabled">Ghost</WlButton><WlButton variant="danger" size="sm" :disabled="demoDisabled">Danger</WlButton></div></div>
          <div class="wl-inline" data-space="sm"><WlTag variant="green">Готово</WlTag><WlTag variant="amber">В процессе</WlTag><WlTag variant="red">Нужна проверка</WlTag><WlTag variant="gray">Без статуса</WlTag></div>
          <WlAlert variant="info" title="Цвета статусов сохраняют смысл">Успех, предупреждение и ошибка наследуются от выбранной основы.</WlAlert>
        </section>
        <section class="tb-contrast wl-stack" data-space="md" aria-labelledby="tb-contrast-title">
          <div class="tb-section-header"><h2 id="tb-contrast-title" class="wl-text-subheading">Контраст текста</h2><span class="wl-text-small" :class="failedContrast ? 'tb-error' : 'wl-text-muted'">{{ failedContrast ? 'Нужно проверить: ' + failedContrast : 'Показанные пары проходят проверку' }}</span></div>
          <ul class="tb-contrast-list"><li v-for="pair in contrast" :key="pair.key" :data-passes="pair.passes"><span>{{ pair.label }}</span><span class="tb-contrast-value"><WlIcon :name="pair.passes ? 'check-circle' : 'warn'" :size="14" />{{ pair.ratio.toFixed(2) }}:1 <span class="tb-contrast-min">/ {{ pair.minimum }}:1</span></span></li></ul>
          <p class="wl-text-small wl-text-muted">Проверяется несколько цветовых пар, а не доступность всей темы. Яркий основной цвет получает светлый или тёмный текст автоматически; цвета ссылок выбираете вы.</p>
        </section>
      </div>
    </div>

    <section class="tb-export wl-stack" data-space="lg" aria-labelledby="tb-export-title">
      <div class="tb-section-header"><div class="wl-stack" data-space="sm"><h2 id="tb-export-title" class="wl-text-heading">Заберите свою тему</h2><p class="wl-text-body wl-text-muted">Для агента — задача и параметры. JSON — структурированные настройки. CSS — готовая тема с выбранной основой.</p></div><WlButton variant="primary" :disabled="nameInvalid || hexInvalid" @click="exportPanel?.copy()"><template #icon><WlIcon name="copy" :size="16" /></template>{{ exportMode === 'prompt' ? 'Копировать для агента' : 'Копировать ' + exportMode.toUpperCase() }}</WlButton></div>
      <div class="wl-inline" data-space="sm" role="group" aria-label="Формат экспорта"><WlButton v-for="option in exportOptions" :key="option.value" size="sm" :variant="exportMode === option.value ? 'soft' : 'secondary'" :aria-pressed="exportMode === option.value" @click="exportMode = option.value">{{ option.label }}</WlButton></div>
      <p v-if="nameInvalid || hexInvalid" class="tb-error wl-text-small" role="alert">Исправьте имя и HEX-значения перед копированием.</p>
      <div v-else data-testid="theme-builder-export"><CodePanel ref="exportPanel" :source="exportSource" :title="exportMode === 'prompt' ? 'Задание для агента' : exportMode === 'json' ? name + '.theme.json' : name + '.css'" :language="exportMode === 'css' ? 'css' : exportMode === 'json' ? 'json' : 'auto'" :expanded="true" /></div>
      <p class="wl-text-small wl-text-muted">CSS подключается после стилей Gavia UI; атрибут data-wl-theme должен стоять на html, чтобы всплывающие элементы получили вашу тему.</p>
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
.tb-demo-bar a { display: inline-flex; align-items: center; gap: 6px; color: var(--wl-accent); text-underline-offset: 3px; }
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