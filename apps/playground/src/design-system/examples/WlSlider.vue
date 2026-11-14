<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlSlider } from "gavia-ui";
import { ref } from "vue";
const value = ref(40);
const marked = ref(50);
const range = ref<[number, number]>([20, 80]);
const marks = [0, 25, 50, 75, 100];
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlSlider
      v-model="value"
      :min="0"
      :max="100"
      :step="10"
      :aria-label="t('examples.volume_0121')"
      v-bind="preview"
    /><p class="wl-text-small">{{ t("examples.volume_0122") }} {{ value }}%</p>
    <WlSlider
      v-bind="preview"
      v-model="marked"
      :range="false"
      :marks="marks"
      :aria-label="t('examples.sliderMarked')"
    />
    <p class="wl-text-small">{{ t("examples.sliderMarkedValue") }} {{ marked }}</p>
    <WlSlider
      v-bind="preview"
      v-model="range"
      range
      :marks="marks"
      :aria-label="t('examples.sliderRange')"
    />
    <p class="wl-text-small">{{ t("examples.sliderRangeValue") }} {{ range.join(' – ') }}</p>
  </div>
</template>
