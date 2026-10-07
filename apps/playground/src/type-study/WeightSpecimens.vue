<script setup lang="ts">
import { computed, ref } from "vue";
import type { SpecimenLanguage } from "./samples";
import { gaviaFontFamily, gaviaWeights } from "./font";
import type { GaviaFontStyle } from "./font";

const props = withDefaults(defineProps<{
  language: SpecimenLanguage;
  fontFamily?: string;
  fontStyle?: GaviaFontStyle;
}>(), {
  fontFamily: gaviaFontFamily,
  fontStyle: "normal"
});

const emit = defineEmits<{ "update:fontStyle": [style: GaviaFontStyle] }>();

const fontStyle = computed(() => props.fontStyle);
const customHeading = ref("");
const weights = gaviaWeights;

const copy = {
  ru: {
    eyebrow: "05 / Семейство Gavia",
    title: "Шесть начертаний",
    description: "Одинаковые слова, разная плотность. От тонкой линии до уверенного акцента — сравните все шесть весов на заголовках, тексте и цифрах.",
    normal: "Прямое",
    italic: "Курсив",
    styleLabel: "Стиль начертаний",
    customTextLabel: "Своя строка",
    sampleHeading: "Ясные формы. Точные решения.",
    sampleParagraph: "Спокойный ритм помогает читать и замечать главное. Буквы оставляют достаточно воздуха, заголовки задают порядок, а цифры сохраняют ясность в датах, суммах и коротких подписях.",
    numeralLabel: "Цифры / Gavia",
    refinement: "Кириллица и латиница — во всех шести весах.",
    collection: "6 весов × 2 стиля / 12 начертаний"
  },
  en: {
    eyebrow: "05 / Gavia family",
    title: "Six weights",
    description: "The same words, a different texture. From a fine line to a confident accent, compare all six weights in headings, paragraphs and numbers.",
    normal: "Upright",
    italic: "Italic",
    styleLabel: "Typeface style",
    customTextLabel: "Your text",
    sampleHeading: "Clear forms. Precise decisions.",
    sampleParagraph: "A calm rhythm makes reading easier and brings the essentials into focus. Letters have room to breathe, headings establish order, and numbers remain clear in dates, amounts and short labels.",
    numeralLabel: "Numbers / Gavia",
    refinement: "Cyrillic and Latin across all six weights.",
    collection: "6 weights × 2 styles / 12 faces"
  }
} as const;

const content = computed(() => copy[props.language]);
const sampleHeading = computed(() => customHeading.value.trim() ? customHeading.value : content.value.sampleHeading);
const styleName = computed(() => fontStyle.value === "normal" ? content.value.normal : content.value.italic);
</script>

<template>
  <section id="wl-type-weights" class="wl-weights-section" :lang="props.language" :style="{ '--wl-weights-sample-family': props.fontFamily, '--wl-weights-sample-style': fontStyle }" aria-labelledby="wl-weights-title" data-wl="gavia-weight-specimens">
    <header class="wl-weights-header">
      <div class="wl-weights-heading-group">
        <p class="wl-weights-eyebrow">{{ content.eyebrow }}</p>
        <h2 id="wl-weights-title" class="wl-weights-title">{{ content.title }}</h2>
        <p class="wl-weights-introduction">{{ content.description }}</p>
      </div>
      <div class="wl-weights-style-group">
        <div class="wl-weights-style-controls" role="group" :aria-label="content.styleLabel">
          <button class="wl-weights-style-button" :class="{ 'wl-weights-style-selected': fontStyle === 'normal' }" type="button" :aria-pressed="fontStyle === 'normal'" @click="emit('update:fontStyle', 'normal')">{{ content.normal }}</button>
          <button class="wl-weights-style-button" :class="{ 'wl-weights-style-selected': fontStyle === 'italic' }" type="button" :aria-pressed="fontStyle === 'italic'" @click="emit('update:fontStyle', 'italic')">{{ content.italic }}</button>
        </div>
        <p class="wl-weights-collection">{{ content.collection }}</p>
      </div>
    </header>

    <div class="wl-weights-custom-text">
      <label class="wl-weights-custom-label" for="wl-weights-custom-heading">{{ content.customTextLabel }}</label>
      <input id="wl-weights-custom-heading" v-model="customHeading" class="wl-weights-custom-input" type="text" placeholder="Gavia · I l 1 O 0 · Ёё Йй Жж Дд Лл · 12 480 ₽" autocomplete="off" :spellcheck="false" />
    </div>

    <div class="wl-weights-list" :aria-label="`${content.title}: ${styleName}`">
      <article v-for="weight in weights" :key="weight.value" class="wl-weights-row" :style="{ '--wl-weights-sample-weight': weight.value }" :data-weight="weight.value" :data-font-style="fontStyle" :aria-labelledby="`wl-weights-name-${weight.value}`">
        <div class="wl-weights-label">
          <span class="wl-weights-weight-value">{{ weight.value }}</span>
          <h3 :id="`wl-weights-name-${weight.value}`" class="wl-weights-name">{{ props.language === 'ru' ? weight.ru : weight.name }}</h3>
          <span class="wl-weights-name-english">{{ weight.name }}<span v-if="fontStyle === 'italic'"> Italic</span></span>
        </div>
        <div class="wl-weights-text-samples">
          <p class="wl-weights-sample-heading">{{ sampleHeading }}</p>
          <p class="wl-weights-sample-paragraph">{{ content.sampleParagraph }}</p>
        </div>
        <div class="wl-weights-numeral-samples">
          <span class="wl-weights-numeral-label">{{ content.numeralLabel }}</span>
          <p class="wl-weights-digits">0123456789</p>
          <div class="wl-weights-number-details">
            <span class="wl-weights-amount">12 480 ₽</span>
            <span class="wl-weights-date">06.10.2026</span>
          </div>
        </div>
      </article>
    </div>

    <footer class="wl-weights-footer">
      <p class="wl-weights-refinement">{{ content.refinement }}</p>
    </footer>
  </section>
</template>
