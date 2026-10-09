<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t, locale } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { samples } from "./samples";
import type { SpecimenLanguage } from "./samples";
import WeightSpecimens from "./WeightSpecimens.vue";
import WlButton from "../../../../packages/ui-kit/src/components/WlButton.vue";
import WlSelect from "../../../../packages/ui-kit/src/components/WlSelect.vue";
import WlSlider from "../../../../packages/ui-kit/src/components/WlSlider.vue";
import WlTextarea from "../../../../packages/ui-kit/src/components/WlTextarea.vue";
import WlSegmented from "../../../../packages/ui-kit/src/components/WlSegmented.vue";
import FontDownloadLink from "../project/FontDownloadLink.vue";
import PlaygroundPageHeader from "../PlaygroundPageHeader.vue";
import type { WlThemeName } from "../../../../packages/ui-kit/src/types";
import type { PlaygroundView } from "../navigation";
import { withPlaygroundTheme } from "../themes";
import { usePageAnchor } from "../usePageAnchor";
import "./type-study.css";
import "./weights.css";
import { gaviaFontFamily, gaviaRelease, gaviaWeights } from "./font";
import type { GaviaFontStyle, GaviaFontWeight } from "./font";

const props = defineProps<{ theme: WlThemeName }>();
const emit = defineEmits<{ navigate: [view: PlaygroundView] }>();
const pageElement = ref<HTMLElement | null>(null);
usePageAnchor(pageElement);

const language = ref<SpecimenLanguage>(locale.value === "ru" ? "ru" : "en");
const saved = ref(false);
const fontStyle = ref<GaviaFontStyle>("normal");
const fontFamily = gaviaFontFamily;
const proofWeight = ref<GaviaFontWeight>(400);
const proofSize = ref(32);
const proofText = ref("");

const copy = {
  ru: {
    edition: t('shell.type_study.GaviaTypeStudy.text496'),
    aboutLabel: t('shell.type_study.GaviaTypeStudy.text497'),
    aboutTitle: t('shell.type_study.GaviaTypeStudy.text498'),
    aboutDescription: t('shell.type_study.GaviaTypeStudy.text499'),
    languageTitle: t('shell.type_study.GaviaTypeStudy.text500'),
    languageDescription: t('shell.type_study.GaviaTypeStudy.text501'),
    familyTitle: t('shell.type_study.GaviaTypeStudy.text502'),
    familyDescription: t('shell.type_study.GaviaTypeStudy.text503'),
    standaloneTitle: t('shell.type_study.GaviaTypeStudy.text504'),
    standaloneDescription: t('shell.type_study.GaviaTypeStudy.text505'),
    numbers: t('shell.type_study.GaviaTypeStudy.text506'),
    numbersTitle: t('shell.type_study.GaviaTypeStudy.text507'),
    numbersDescription: t('shell.type_study.GaviaTypeStudy.text508'),
    tabularTitle: t('shell.type_study.GaviaTypeStudy.text509'),
    tabularDescription: t('shell.type_study.GaviaTypeStudy.text510'),
    proportionalTitle: t('shell.type_study.GaviaTypeStudy.text511'),
    proportionalDescription: t('shell.type_study.GaviaTypeStudy.text512'),
    numbersExample: t('shell.type_study.GaviaTypeStudy.text513'),
    proof: t('shell.type_study.GaviaTypeStudy.text514'),
    proofTitle: t('shell.type_study.GaviaTypeStudy.text515'),
    proofDescription: t('shell.type_study.GaviaTypeStudy.text516'),
    proofWeight: t('shell.type_study.GaviaTypeStudy.text517'),
    proofSize: t('shell.type_study.GaviaTypeStudy.text518'),
    proofTextLabel: t('shell.type_study.GaviaTypeStudy.text519'),
    proofPlaceholder: t('shell.type_study.GaviaTypeStudy.text520'),
    proofExample: t('shell.type_study.GaviaTypeStudy.text521'),
    latin: t('shell.type_study.GaviaTypeStudy.text522'),
    cyrillic: t('shell.type_study.GaviaTypeStudy.text523'),
    installation: t('shell.type_study.GaviaTypeStudy.text524'),
    installationTitle: t('shell.type_study.GaviaTypeStudy.text525'),
    installationDescription: t('shell.type_study.GaviaTypeStudy.text526'),
    installationImport: t('shell.type_study.GaviaTypeStudy.text527'),
    standaloneImport: t('shell.type_study.GaviaTypeStudy.text528'),
    download: t('shell.type_study.GaviaTypeStudy.text529'),
    downloadDetails: t('shell.type_study.GaviaTypeStudy.text530'),
    packageNote: t('shell.type_study.GaviaTypeStudy.text531'),
    provenance: t('shell.type_study.GaviaTypeStudy.text532'),
    demoNote: t('shell.type_study.GaviaTypeStudy.text533'),
    installationFamily: t('shell.type_study.GaviaTypeStudy.text534'),
    installationNote: t('shell.type_study.GaviaTypeStudy.text535'),
    formats: t('shell.type_study.GaviaTypeStudy.text536'),
    weights: "100 · 300 · 400 · 500 · 600 · 700",
    top: t('shell.type_study.GaviaTypeStudy.text537'),
    headline: t('shell.type_study.GaviaTypeStudy.text538'),
    readingHeadline: t('shell.type_study.GaviaTypeStudy.text539'),
    interfaceHeadline: t('shell.type_study.GaviaTypeStudy.text540'),
    direction: t('shell.type_study.GaviaTypeStudy.text541'),
    typeLabel: t('shell.type_study.GaviaTypeStudy.text542'),
    readingLabel: t('shell.type_study.GaviaTypeStudy.text543'),
    interfaceLabel: t('shell.type_study.GaviaTypeStudy.text544'),
    proportional: t('shell.type_study.GaviaTypeStudy.text545'),
    alphabets: t('shell.type_study.GaviaTypeStudy.text546'),
    glyphLabel: t('shell.type_study.GaviaTypeStudy.text547'),
    project: t('shell.type_study.GaviaTypeStudy.text548'),
    projectLabel: t('shell.type_study.GaviaTypeStudy.text549'),
    balance: t('shell.type_study.GaviaTypeStudy.text550'),
    updated: t('shell.type_study.GaviaTypeStudy.text551'),
    date: "06.10.2026",
    save: t('shell.type_study.GaviaTypeStudy.text552'),
    saved: t('shell.type_study.GaviaTypeStudy.text553'),
    settings: t('shell.type_study.GaviaTypeStudy.text554'),
    search: t('shell.type_study.GaviaTypeStudy.text555'),
    searchPlaceholder: t('shell.type_study.GaviaTypeStudy.text556'),
    searchLabel: t('shell.type_study.GaviaTypeStudy.text557'),
    saveStatus: t('shell.type_study.GaviaTypeStudy.text558'),
    fontNote: t('shell.type_study.GaviaTypeStudy.text559'),
    back: t('shell.type_study.GaviaTypeStudy.text560')
  }
} as const;

const content = computed(() => copy.ru);
const languageOptions = [{ label: t('shell.type_study.GaviaTypeStudy.text562'), value: "ru" }, { label: "English", value: "en" }];
const styleOptions = computed(() => [{ label: t('shell.type_study.GaviaTypeStudy.text563'), value: "normal" }, { label: t('shell.type_study.GaviaTypeStudy.text564'), value: "italic" }]);
const weightOptions = computed(() => gaviaWeights.map(weight => ({ value: weight.value, label: weight.value + " — " + weight.ru })));
function chooseLanguage(value: string | null): void { if (value === "ru" || value === "en") language.value = value; }
function chooseStyle(value: string | null): void { if (value === "normal" || value === "italic") fontStyle.value = value; }
function chooseWeight(value: unknown): void { if (gaviaWeights.some(weight => weight.value === value)) proofWeight.value = value as GaviaFontWeight; }
const standaloneCode = '<link rel="stylesheet" href="./gavia.css">\n<style>body { font-family: "Gavia Sans", sans-serif; text-rendering: geometricPrecision; }</style>';
const paragraphs = computed(() => samples[language.value].body.split("\n\n"));
const proofSample = computed(() => proofText.value.trim() ? proofText.value : content.value.proofExample);
const exampleBalance = computed(() => language.value === "ru" ? "12 480 ₽" : "€128.40");
const playgroundUrl = computed(() => withPlaygroundTheme("?view=docs", props.theme));
const numeralRows = computed(() => language.value === "ru" ? ["11 111,00", "88 888,00", "10 240,50"] : ["11,111.00", "88,888.00", "10,240.50"]);
const fontImportCode = 'import "gavia-ui/styles/fonts/gavia.css";';
const fontFamilyCode = ".app {\n  font-family: \"Gavia Sans\", \"Segoe UI\", sans-serif;\n  text-rendering: geometricPrecision;\n}";

function saveProject(): void {
  saved.value = true;
}

</script>

<template>
  <div ref="pageElement" class="wl-type-page" data-testid="font-page" :lang="locale" :data-font-style="fontStyle" :style="{ '--wl-type-sample-style': fontStyle }" data-wl="gavia-type-study">
    <main class="wl-type-shell wl-container">
      <PlaygroundPageHeader title="Gavia Sans" :description="t('shell.type_study.GaviaTypeStudy.text565')" :breadcrumbs="[{ label: 'Gavia Sans' }]" />
      <section id="type-settings" class="wl-type-controls wl-type-controls-with-weights" :aria-label="t('shell.type_study.GaviaTypeStudy.text566')">
        <WlSegmented class="wl-type-languages" :model-value="language" :options="languageOptions" :aria-label="t('shell.type_study.GaviaTypeStudy.text567')" @update:model-value="chooseLanguage" />
        <WlSegmented class="wl-type-style-controls" :model-value="fontStyle" :options="styleOptions" :aria-label="t('shell.type_study.GaviaTypeStudy.text568')" @update:model-value="chooseStyle" />
        <a class="wl-type-link wl-weights-jump-link" href="#wl-type-weights">{{ t('shell.type_study.GaviaTypeStudy.text569') }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-proof-link" href="#wl-type-proof">{{ content.proof }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-numbers-link" href="#wl-type-numbers">{{ content.numbers }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-install-link" href="#wl-type-install">{{ content.installation }} <span aria-hidden="true">↓</span></a>
      </section>

      <section id="type-top" class="wl-type-hero" aria-labelledby="wl-type-hero-title">
        <div class="wl-type-hero-main">
          <p class="wl-type-section-label wl-type-detail">Gavia Sans {{ gaviaRelease }} · 01 / {{ content.typeLabel }}</p>
          <h2 id="wl-type-hero-title" class="wl-type-display">{{ content.headline }}</h2>
          <p class="wl-type-direction">{{ content.direction }}</p>
          <FontDownloadLink class="wl-type-hero-download">{{ content.download }}</FontDownloadLink>
        </div>
        <aside class="wl-type-side-note">
          <div class="wl-type-letterform" aria-hidden="true">Gg<span class="wl-type-letterform-dot">.</span></div>
          <span class="wl-type-specification wl-type-detail">GAVIA SANS / 500</span>
          <p class="wl-type-proportional">{{ content.proportional }}</p>
          <p class="wl-type-alphabets wl-type-detail">{{ content.alphabets }}</p>
        </aside>
      </section>

      <section class="wl-type-about" aria-labelledby="wl-type-about-title" data-wl="gavia-type-overview">
        <header class="wl-type-about-header">
          <p class="wl-type-section-label">{{ content.aboutLabel }}</p>
          <h2 id="wl-type-about-title" class="wl-type-about-title">{{ content.aboutTitle }}</h2>
          <p class="wl-type-about-description">{{ content.aboutDescription }}</p>
        </header>
        <div class="wl-type-about-grid">
          <article class="wl-type-about-card">
            <h3 class="wl-type-about-card-title">{{ content.languageTitle }}</h3>
            <p class="wl-type-about-card-description">{{ content.languageDescription }}</p>
          </article>
          <article class="wl-type-about-card">
            <h3 class="wl-type-about-card-title">{{ content.familyTitle }}</h3>
            <p class="wl-type-about-card-description">{{ content.familyDescription }}</p>
          </article>
          <article class="wl-type-about-card">
            <h3 class="wl-type-about-card-title">{{ content.standaloneTitle }}</h3>
            <p class="wl-type-about-card-description">{{ content.standaloneDescription }}</p>
          </article>
        </div>
      </section>

      <section class="wl-type-reading" aria-labelledby="wl-type-reading-title">
        <div class="wl-type-reading-heading">
          <p class="wl-type-section-label wl-type-detail">02 / {{ content.readingLabel }}</p>
          <h2 id="wl-type-reading-title" class="wl-type-heading">{{ content.readingHeadline }}</h2>
          <p class="wl-type-reading-spec wl-type-detail">GAVIA SANS / 400<br />17 px · 1.75</p>
        </div>
        <div class="wl-type-body-copy" :lang="language">
          <p v-for="paragraph in paragraphs" :key="paragraph" class="wl-type-paragraph">{{ paragraph }}</p>
        </div>
      </section>

      <section class="wl-type-interface" aria-labelledby="wl-type-interface-title">
        <p class="wl-type-section-label wl-type-detail">03 / {{ content.interfaceLabel }}</p>
        <h2 id="wl-type-interface-title" class="wl-type-interface-heading">{{ content.interfaceHeadline }}</h2>
        <div class="wl-type-project-header">
          <div class="wl-type-project-name-group">
            <span class="wl-type-project-label wl-type-detail">{{ content.projectLabel }} / 078</span>
            <span class="wl-type-project-name">{{ content.project }}</span>
          </div>
          <div class="wl-type-project-stats">
            <div class="wl-type-stat">
              <span class="wl-type-stat-label">{{ content.balance }}</span>
              <span class="wl-type-stat-value wl-type-detail">{{ exampleBalance }}</span>
            </div>
            <div class="wl-type-stat">
              <span class="wl-type-stat-label">{{ content.updated }}</span>
              <span class="wl-type-stat-date wl-type-detail">{{ content.date }}</span>
            </div>
          </div>
        </div>
        <div class="wl-type-ui-line">
          <WlButton class="wl-type-demo-action" variant="primary" :disabled="saved" @click="saveProject">{{ saved ? content.saved : content.save }}</WlButton>
          <a class="wl-type-secondary" href="#type-settings">{{ content.settings }}</a>
          <span v-if="saved" class="wl-type-save-status" role="status">{{ content.saveStatus }}</span>
          <span v-else class="wl-type-ui-digits wl-type-detail">0123456789</span>
        </div>
        <p class="wl-type-demo-note">{{ content.demoNote }}</p>
        <div class="wl-type-glyph-row">
          <span class="wl-type-glyph-label wl-type-detail">{{ content.glyphLabel }}</span>
          <span class="wl-type-glyphs" lang="en">I l 1 O 0</span>
          <span class="wl-type-glyph-divider" aria-hidden="true">/</span>
          <span class="wl-type-glyphs" lang="ru">Ё Й Ж Д Л</span>
        </div>
        <p class="wl-type-font-note">{{ content.fontNote }}</p>
      </section>

      <section id="wl-type-proof" class="wl-type-proof" aria-labelledby="wl-type-proof-title" data-wl="gavia-type-proof">
        <header class="wl-type-proof-header">
          <p class="wl-type-section-label">04 / {{ content.proof }}</p>
          <h2 id="wl-type-proof-title" class="wl-type-proof-title">{{ content.proofTitle }}</h2>
          <p class="wl-type-proof-description">{{ content.proofDescription }}</p>
        </header>
        <div class="wl-type-proof-controls">
          <div class="wl-type-proof-control">
            <label class="wl-type-proof-label" for="wl-type-proof-weight">{{ content.proofWeight }}</label>
            <WlSelect id="wl-type-proof-weight" class="wl-type-proof-select" :model-value="proofWeight" :options="weightOptions" option-label="label" option-value="value" :aria-label="content.proofWeight" @update:model-value="chooseWeight" />
          </div>
          <label class="wl-type-proof-size-control">
            <span class="wl-type-proof-label">{{ content.proofSize }} <output>{{ proofSize }} px</output></span>
            <WlSlider v-model="proofSize" class="wl-type-proof-range" :min="12" :max="72" :step="1" :aria-label="content.proofSize" />
          </label>
        </div>
        <label class="wl-type-proof-text-control">
          <span class="wl-type-proof-label">{{ content.proofTextLabel }}</span>
          <WlTextarea v-model="proofText" class="wl-type-proof-textarea" :rows="2" :placeholder="content.proofPlaceholder" :spellcheck="false" />
        </label>
        <p class="wl-type-proof-sample" :data-weight="proofWeight" :data-size="proofSize" :data-font-style="fontStyle" :style="{ fontWeight: proofWeight, fontSize: proofSize + 'px' }">{{ proofSample }}</p>
        <div class="wl-type-alphabet-list" :style="{ '--wl-type-alphabet-weight': proofWeight }">
          <div class="wl-type-alphabet-row">
            <span class="wl-type-alphabet-label">{{ content.latin }}</span>
            <p class="wl-type-alphabet-sample" lang="en">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz</p>
          </div>
          <div class="wl-type-alphabet-row">
            <span class="wl-type-alphabet-label">{{ content.cyrillic }}</span>
            <p class="wl-type-alphabet-sample" lang="ru">АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ<br />абвгдеёжзийклмнопрстуфхцчшщъыьэюя</p>
          </div>
        </div>
      </section>

      <WeightSpecimens v-model:font-style="fontStyle" :language="language" :font-family="fontFamily" />

      <section id="wl-type-numbers" class="wl-type-numbers" aria-labelledby="wl-type-numbers-title" data-wl="gavia-numeral-spacing">
        <header class="wl-type-numbers-header">
          <p class="wl-type-section-label">06 / {{ content.numbers }}</p>
          <h2 id="wl-type-numbers-title" class="wl-type-numbers-title">{{ content.numbersTitle }}</h2>
          <p class="wl-type-numbers-description">{{ content.numbersDescription }}</p>
        </header>
        <div class="wl-type-number-cards">
          <article class="wl-type-number-card">
            <h3 class="wl-type-number-card-title">{{ content.tabularTitle }}</h3>
            <p class="wl-type-number-card-description">{{ content.tabularDescription }}</p>
            <div class="wl-type-number-sample wl-type-number-tabular" data-numerals="tabular" :aria-label="content.numbersExample">
              <p v-for="row in numeralRows" :key="row" class="wl-type-number-line">{{ row }}</p>
            </div>
            <code class="wl-type-number-code">font-variant-numeric: tabular-nums;</code>
          </article>
          <article class="wl-type-number-card">
            <h3 class="wl-type-number-card-title">{{ content.proportionalTitle }}</h3>
            <p class="wl-type-number-card-description">{{ content.proportionalDescription }}</p>
            <div class="wl-type-number-sample wl-type-number-proportional" data-numerals="proportional" :aria-label="content.numbersExample">
              <p v-for="row in numeralRows" :key="row" class="wl-type-number-line">{{ row }}</p>
            </div>
            <code class="wl-type-number-code">font-variant-numeric: proportional-nums;</code>
          </article>
        </div>
      </section>

      <section id="wl-type-install" class="wl-type-install" aria-labelledby="wl-type-install-title" data-wl="gavia-font-installation">
        <header class="wl-type-install-header">
          <p class="wl-type-section-label">07 / {{ content.installation }}</p>
          <h2 id="wl-type-install-title" class="wl-type-install-title">{{ content.installationTitle }}</h2>
          <p class="wl-type-install-description">{{ content.installationDescription }}</p>
        </header>
        <div class="wl-type-download-block">
          <FontDownloadLink>{{ content.download }}</FontDownloadLink>
          <span class="wl-type-download-details">{{ content.downloadDetails }}</span>
        </div>
        <p class="wl-type-install-note">{{ content.packageNote }}</p>
        <ul class="wl-type-install-specifications">
          <li class="wl-type-install-specification">{{ content.edition }}</li>
          <li class="wl-type-install-specification">{{ content.alphabets }}</li>
          <li class="wl-type-install-specification">{{ content.formats }}</li>
          <li class="wl-type-install-specification">{{ content.weights }}</li>
        </ul>
        <div class="wl-type-install-example wl-type-standalone-example">
          <p class="wl-type-install-caption">{{ content.standaloneImport }}</p>
          <pre class="wl-type-install-code"><code>{{ standaloneCode }}</code></pre>
        </div>
        <div class="wl-type-install-code-group">
          <div class="wl-type-install-example">
            <p class="wl-type-install-caption">{{ content.installationImport }}</p>
            <pre class="wl-type-install-code"><code>{{ fontImportCode }}</code></pre>
          </div>
          <div class="wl-type-install-example">
            <p class="wl-type-install-caption">{{ content.installationFamily }}</p>
            <pre class="wl-type-install-code"><code>{{ fontFamilyCode }}</code></pre>
          </div>
        </div>
        <p class="wl-type-install-note">{{ content.installationNote }}</p>
        <p class="wl-type-install-note">{{ content.provenance }}</p>
      </section>

      <footer class="wl-type-footer">
        <p class="wl-type-footer-note">Gavia Sans {{ gaviaRelease }} · {{ content.edition }} · {{ content.alphabets }}</p>
        <div class="wl-type-footer-links">
          <a class="wl-type-link" :href="playgroundUrl" @click.prevent="emit('navigate', 'docs')">{{ content.back }} <span aria-hidden="true">↗</span></a>
          <a class="wl-type-link" href="#type-top">{{ content.top }} <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </main>
  </div>
</template>
