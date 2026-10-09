<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t, locale } = usePlaygroundI18n();
import { computed, ref } from "vue";
import WlSegmented from "../../../../packages/ui-kit/src/components/WlSegmented.vue";
import WlInput from "../../../../packages/ui-kit/src/components/WlInput.vue";
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
    eyebrow: t('shell.type_study.WeightSpecimens.text573'),
    title: t('shell.type_study.WeightSpecimens.text574'),
    description: t('shell.type_study.WeightSpecimens.text575'),
    normal: t('shell.type_study.WeightSpecimens.text576'),
    italic: t('shell.type_study.WeightSpecimens.text577'),
    styleLabel: t('shell.type_study.WeightSpecimens.text578'),
    customTextLabel: t('shell.type_study.WeightSpecimens.text579'),
    sampleHeading: t('shell.type_study.WeightSpecimens.text580'),
    sampleParagraph: t('shell.type_study.WeightSpecimens.text581'),
    numeralLabel: t('shell.type_study.WeightSpecimens.text582'),
    refinement: t('shell.type_study.WeightSpecimens.text583'),
    collection: t('shell.type_study.WeightSpecimens.text584')
  }
} as const;

const content = computed(() => copy.ru);
const styleOptions = computed(() => [{ label: content.value.normal, value: "normal" }, { label: content.value.italic, value: "italic" }]);
function chooseStyle(value: string | null): void { if (value === "normal" || value === "italic") emit("update:fontStyle", value); }
const sampleHeading = computed(() => customHeading.value.trim() ? customHeading.value : content.value.sampleHeading);
const styleName = computed(() => fontStyle.value === "normal" ? content.value.normal : content.value.italic);
</script>

<template>
  <section id="wl-type-weights" class="wl-weights-section" :lang="locale" :style="{ '--wl-weights-sample-family': props.fontFamily, '--wl-weights-sample-style': fontStyle }" aria-labelledby="wl-weights-title" data-wl="gavia-weight-specimens">
    <header class="wl-weights-header">
      <div class="wl-weights-heading-group">
        <p class="wl-weights-eyebrow">{{ content.eyebrow }}</p>
        <h2 id="wl-weights-title" class="wl-weights-title">{{ content.title }}</h2>
        <p class="wl-weights-introduction">{{ content.description }}</p>
      </div>
      <div class="wl-weights-style-group">
        <WlSegmented class="wl-weights-style-controls" :model-value="fontStyle" :options="styleOptions" :aria-label="content.styleLabel" @update:model-value="chooseStyle" />
        <p class="wl-weights-collection">{{ content.collection }}</p>
      </div>
    </header>

    <div class="wl-weights-custom-text">
      <label class="wl-weights-custom-label" for="wl-weights-custom-heading">{{ content.customTextLabel }}</label>
      <WlInput id="wl-weights-custom-heading" v-model="customHeading" class="wl-weights-custom-input" placeholder="Gavia Sans · I l 1 O 0 · Ёё Йй Жж Дд Лл · 12 480 ₽" autocomplete="off" :spellcheck="false" />
    </div>

    <div class="wl-weights-list" :aria-label="`${content.title}: ${styleName}`">
      <article v-for="weight in weights" :key="weight.value" class="wl-weights-row" :style="{ '--wl-weights-sample-weight': weight.value }" :data-weight="weight.value" :data-font-style="fontStyle" :aria-labelledby="`wl-weights-name-${weight.value}`">
        <div class="wl-weights-label">
          <span class="wl-weights-weight-value">{{ weight.value }}</span>
          <h3 :id="`wl-weights-name-${weight.value}`" class="wl-weights-name">{{ weight.ru }}</h3>
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
