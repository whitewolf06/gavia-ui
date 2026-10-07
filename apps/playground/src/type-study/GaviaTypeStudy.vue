<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { samples } from "./samples";
import type { SpecimenLanguage } from "./samples";
import WeightSpecimens from "./WeightSpecimens.vue";
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

const language = ref<SpecimenLanguage>("ru");
const saved = ref(false);
const fontStyle = ref<GaviaFontStyle>("normal");
const fontFamily = gaviaFontFamily;
const proofWeight = ref<GaviaFontWeight>(400);
const proofSize = ref(32);
const proofText = ref("");

const copy = {
  ru: {
    edition: "6 весов, 12 начертаний",
    aboutLabel: "Типографика UI Kit",
    aboutTitle: "Один ритм для всего интерфейса",
    aboutDescription: "Gavia — основная гарнитура темы Gavia в UI Kit. Стройная геометрия объединяет заголовки, абзацы, кнопки и короткие подписи, сохраняя спокойный ритм в плотном интерфейсе.",
    languageTitle: "Кириллица и латиница",
    languageDescription: "Русские и английские тексты, цифры, пунктуация и знаки валют — в одном семействе.",
    familyTitle: "Шесть весов, два стиля",
    familyDescription: "Thin, Light, Regular, Medium, SemiBold и Bold. Для каждого веса есть прямое и наклонное начертание отдельными файлами.",
    standaloneTitle: "Для веба и приложений",
    standaloneDescription: "WOFF2 для веба и TTF для приложений. Шрифт можно подключить самостоятельно, без Vue и компонентов UI Kit.",
    numbers: "Цифры",
    numbersTitle: "Ровные колонки и свободный набор",
    numbersDescription: "Выбирайте ширину цифр под задачу. Формы знаков сохраняются, меняются их интервалы и ширина места в строке.",
    tabularTitle: "Табличные · tnum",
    tabularDescription: "Каждая цифра занимает одинаковую ширину. Удобно для сумм, таблиц, дат и счётчиков. Это режим Gavia по умолчанию.",
    proportionalTitle: "Пропорциональные · pnum",
    proportionalDescription: "Ширина зависит от формы цифры. Подходит для заголовков и отдельных чисел в тексте.",
    numbersExample: "Одинаковые числа · Regular 400",
    proof: "Проба гарнитуры",
    proofTitle: "Проверьте свой текст",
    proofDescription: "Выберите вес и размер, чтобы увидеть Gavia в своей строке.",
    proofWeight: "Вес",
    proofSize: "Размер",
    proofTextLabel: "Свой текст",
    proofPlaceholder: "Введите одну или несколько строк",
    proofExample: "Ясные формы. Точные решения.\nГавиа / Gavia · 0123456789",
    latin: "Латиница",
    cyrillic: "Кириллица",
    installation: "Подключить шрифт",
    installationTitle: "Gavia в вашем приложении",
    installationDescription: "Подключите CSS шрифта в приложении. Тема Gavia выбирает эту гарнитуру для текста и заголовков; семейство можно использовать и в собственных стилях.",
    installationImport: "Импорт шрифта",
    installationFamily: "Семейство в CSS",
    installationNote: "Для самостоятельного использования достаточно файлов шрифта и CSS с font-family: Gavia. Vue и компоненты UI Kit не требуются. Шрифт распространяется по SIL Open Font License 1.1 (OFL); код UI Kit — по MIT.",
    formats: "TTF для приложений · WOFF2 для веба",
    weights: "100 · 300 · 400 · 500 · 600 · 700",
    top: "Наверх",
    headline: "Ясность\nв каждой детали",
    readingHeadline: "Северный ритм.\nЧистая геометрия.",
    interfaceHeadline: "Пространство для важных решений",
    direction: "Стройные формы, спокойный текст и мягкие, точные окончания.",
    typeLabel: "Форма и ритм",
    readingLabel: "Длинный текст",
    interfaceLabel: "В интерфейсе",
    proportional: "Пропорциональный набор",
    alphabets: "Кириллица / латиница",
    glyphLabel: "Различимость знаков",
    project: "Северные сады",
    projectLabel: "Проект",
    balance: "Доступно",
    updated: "Обновлено",
    date: "06.10.2026",
    save: "Сохранить проект",
    saved: "Сохранено",
    settings: "Настройки",
    search: "Поиск",
    searchPlaceholder: "Введите свой текст",
    searchLabel: "Проверить свой текст",
    saveStatus: "Изменения сохранены",
    fontNote: "Ясные формы для заголовков, абзацев и строк с числами.",
    back: "К документации UI Kit"
  },
  en: {
    edition: "6 weights, 12 faces",
    aboutLabel: "UI kit typography",
    aboutTitle: "A shared rhythm for the whole interface",
    aboutDescription: "Gavia is the Gavia theme's primary typeface within the UI kit. Slender geometry connects headings, paragraphs, buttons and short labels, keeping a calm rhythm in dense interfaces.",
    languageTitle: "Cyrillic and Latin",
    languageDescription: "Russian and English text, numerals, punctuation and currency symbols in one family.",
    familyTitle: "Six weights, two styles",
    familyDescription: "Thin, Light, Regular, Medium, SemiBold and Bold. Each weight comes with upright and oblique forms in separate font files.",
    standaloneTitle: "For the web and applications",
    standaloneDescription: "WOFF2 for the web and TTF for applications. Use the typeface independently, without Vue or UI kit components.",
    numbers: "Numbers",
    numbersTitle: "Aligned columns and natural spacing",
    numbersDescription: "Choose numeral spacing for the task. The character shapes stay the same; their spacing and advances change.",
    tabularTitle: "Tabular · tnum",
    tabularDescription: "Every numeral takes the same width. Useful for amounts, tables, dates and counters. This is Gavia's default mode.",
    proportionalTitle: "Proportional · pnum",
    proportionalDescription: "Widths follow the numeral shapes. Useful for headings and individual numbers within text.",
    numbersExample: "The same numbers · Regular 400",
    proof: "Try the typeface",
    proofTitle: "Try your own text",
    proofDescription: "Choose a weight and size to see Gavia in your own words.",
    proofWeight: "Weight",
    proofSize: "Size",
    proofTextLabel: "Your text",
    proofPlaceholder: "Enter one or several lines",
    proofExample: "Clear forms. Precise decisions.\nGavia / Гавиа · 0123456789",
    latin: "Latin",
    cyrillic: "Cyrillic",
    installation: "Use the typeface",
    installationTitle: "Gavia in your application",
    installationDescription: "Import the font CSS in your application. The Gavia theme uses the typeface for text and headings; you can also use the family in your own styles.",
    installationImport: "Font import",
    installationFamily: "CSS family",
    installationNote: "Standalone use only requires the font files and CSS with font-family: Gavia. Vue and UI kit components are not required. The font is distributed under SIL Open Font License 1.1 (OFL); the UI kit code uses MIT.",
    formats: "TTF for applications · WOFF2 for the web",
    weights: "100 · 300 · 400 · 500 · 600 · 700",
    top: "Back to top",
    headline: "Clarity\nin every detail",
    readingHeadline: "Northern rhythm.\nPure geometry.",
    interfaceHeadline: "Space for thoughtful decisions",
    direction: "Slender forms, calm reading and precise, gentle endings.",
    typeLabel: "Form and rhythm",
    readingLabel: "Longer reading",
    interfaceLabel: "In the interface",
    proportional: "Proportional typography",
    alphabets: "Cyrillic / Latin",
    glyphLabel: "Distinctive characters",
    project: "Northern Gardens",
    projectLabel: "Project",
    balance: "Available",
    updated: "Updated",
    date: "06 Oct 2026",
    save: "Save project",
    saved: "Saved",
    settings: "Settings",
    search: "Search",
    searchPlaceholder: "Enter your own text",
    searchLabel: "Try your own text",
    saveStatus: "Changes saved",
    fontNote: "Clear forms for headings, paragraphs and rows of numbers.",
    back: "Back to UI kit documentation"
  }
} as const;

const content = computed(() => copy[language.value]);
const paragraphs = computed(() => samples[language.value].body.split("\n\n"));
const proofSample = computed(() => proofText.value.trim() ? proofText.value : content.value.proofExample);
const searchOpen = ref(false);
const customText = ref("");
const exampleBalance = computed(() => language.value === "ru" ? "12 480 ₽" : "€128.40");
const playgroundUrl = computed(() => withPlaygroundTheme("?view=docs", props.theme));
const numeralRows = computed(() => language.value === "ru" ? ["11 111,00", "88 888,00", "10 240,50"] : ["11,111.00", "88,888.00", "10,240.50"]);
const fontImportCode = 'import "gavia-ui/styles/fonts/gavia.css";';
const fontFamilyCode = ".app {\n  font-family: \"Gavia\", \"Segoe UI\", sans-serif;\n}";

function saveProject(): void {
  saved.value = true;
}

function handleSaveShortcut(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.code === "KeyS") {
    event.preventDefault();
    saveProject();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleSaveShortcut);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleSaveShortcut);
});
</script>

<template>
  <div ref="pageElement" class="wl-type-page" data-testid="font-page" :lang="language" :data-font-style="fontStyle" :style="{ '--wl-type-sample-style': fontStyle }" data-wl="gavia-type-study">
    <main class="wl-type-shell">
      <section id="type-settings" class="wl-type-controls wl-type-controls-with-weights" :aria-label="language === 'ru' ? 'Настройки типографического примера' : 'Typography example settings'">
        <div class="wl-type-languages" role="group" :aria-label="language === 'ru' ? 'Язык образцов' : 'Sample language'">
          <button class="wl-type-language" :class="{ 'wl-type-language-selected': language === 'ru' }" type="button" :aria-pressed="language === 'ru'" @click="language = 'ru'">Русский</button>
          <button class="wl-type-language" :class="{ 'wl-type-language-selected': language === 'en' }" type="button" :aria-pressed="language === 'en'" @click="language = 'en'">English</button>
        </div>
        <div class="wl-type-style-controls" role="group" :aria-label="language === 'ru' ? 'Начертание образцов' : 'Sample style'">
          <button class="wl-type-language" :class="{ 'wl-type-language-selected': fontStyle === 'normal' }" type="button" :aria-pressed="fontStyle === 'normal'" @click="fontStyle = 'normal'">{{ language === "ru" ? "Прямое" : "Upright" }}</button>
          <button class="wl-type-language" :class="{ 'wl-type-language-selected': fontStyle === 'italic' }" type="button" :aria-pressed="fontStyle === 'italic'" @click="fontStyle = 'italic'">{{ language === "ru" ? "Курсив" : "Italic" }}</button>
        </div>
        <a class="wl-type-link wl-weights-jump-link" href="#wl-type-weights">{{ language === "ru" ? "Шесть начертаний" : "Six weights" }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-proof-link" href="#wl-type-proof">{{ content.proof }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-numbers-link" href="#wl-type-numbers">{{ content.numbers }} <span aria-hidden="true">↓</span></a>
        <a class="wl-type-link wl-type-install-link" href="#wl-type-install">{{ content.installation }} <span aria-hidden="true">↓</span></a>
      </section>

      <section id="type-top" class="wl-type-hero" aria-labelledby="wl-type-hero-title">
        <div class="wl-type-hero-main">
          <p class="wl-type-section-label wl-type-detail">Gavia {{ gaviaRelease }} · 01 / {{ content.typeLabel }}</p>
          <h1 id="wl-type-hero-title" class="wl-type-display">{{ content.headline }}</h1>
          <p class="wl-type-direction">{{ content.direction }}</p>
        </div>
        <aside class="wl-type-side-note">
          <div class="wl-type-letterform" aria-hidden="true">Gg<span class="wl-type-letterform-dot">.</span></div>
          <span class="wl-type-specification wl-type-detail">GAVIA / 500</span>
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
          <p class="wl-type-reading-spec wl-type-detail">GAVIA / 400<br />17 px · 1.75</p>
        </div>
        <div class="wl-type-body-copy">
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
          <button class="wl-type-primary" type="button" :disabled="saved" @click="saveProject">{{ saved ? content.saved : content.save }}<kbd class="wl-type-hotkey wl-type-detail">Ctrl S</kbd></button>
          <a class="wl-type-secondary" href="#type-settings">{{ content.settings }}</a>
          <button class="wl-type-secondary wl-type-search-button" type="button" :aria-expanded="searchOpen" aria-controls="wl-type-custom-input" @click="searchOpen = !searchOpen"><svg class="wl-type-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" stroke-width="1.4" /><path d="m12.5 12.5 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>{{ content.search }}</button>
          <span v-if="saved" class="wl-type-save-status" role="status">{{ content.saveStatus }}</span>
          <span v-else class="wl-type-ui-digits wl-type-detail">0123456789</span>
        </div>
        <div v-if="searchOpen" id="wl-type-custom-input" class="wl-type-custom-sample">
          <label class="wl-type-custom-label" for="wl-type-text-input">{{ content.searchLabel }}</label>
          <input id="wl-type-text-input" v-model="customText" class="wl-type-custom-input" type="text" :placeholder="content.searchPlaceholder" />
          <p v-if="customText" class="wl-type-custom-preview">{{ customText }}</p>
        </div>
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
          <label class="wl-type-proof-control">
            <span class="wl-type-proof-label">{{ content.proofWeight }}</span>
            <select v-model="proofWeight" class="wl-type-proof-select">
              <option v-for="weight in gaviaWeights" :key="weight.value" :value="weight.value">{{ weight.value }} — {{ language === "ru" ? weight.ru : weight.name }}</option>
            </select>
          </label>
          <label class="wl-type-proof-size-control">
            <span class="wl-type-proof-label">{{ content.proofSize }} <output>{{ proofSize }} px</output></span>
            <input v-model.number="proofSize" class="wl-type-proof-range" type="range" min="12" max="72" step="1" :aria-label="content.proofSize" />
          </label>
        </div>
        <label class="wl-type-proof-text-control">
          <span class="wl-type-proof-label">{{ content.proofTextLabel }}</span>
          <textarea v-model="proofText" class="wl-type-proof-textarea" rows="2" :placeholder="content.proofPlaceholder" :spellcheck="false"></textarea>
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
        <ul class="wl-type-install-specifications">
          <li class="wl-type-install-specification">{{ content.edition }}</li>
          <li class="wl-type-install-specification">{{ content.alphabets }}</li>
          <li class="wl-type-install-specification">{{ content.formats }}</li>
          <li class="wl-type-install-specification">{{ content.weights }}</li>
        </ul>
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
      </section>

      <footer class="wl-type-footer">
        <p class="wl-type-footer-note">Gavia {{ gaviaRelease }} · {{ content.edition }} · {{ content.alphabets }}</p>
        <div class="wl-type-footer-links">
          <a class="wl-type-link" :href="playgroundUrl" @click.prevent="emit('navigate', 'docs')">{{ content.back }} <span aria-hidden="true">↗</span></a>
          <a class="wl-type-link" href="#type-top">{{ content.top }} <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </main>
  </div>
</template>
