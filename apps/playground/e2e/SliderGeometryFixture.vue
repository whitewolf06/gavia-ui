<script setup lang="ts">
import { WlSlider } from "gavia-ui";
import { computed, ref } from "vue";

const single = ref(50);
const range = ref<[number, number]>([30, 90]);
const disabled = ref(false);
const invalid = ref(false);
const customTokens = ref(false);
const fluid = ref(true);
const marks = [10, 35, 60, 85, 110];
const longMarks = [
  { value: 10, label: "Minimum temperature setting with a long endpoint label" },
  { value: 110, label: "Maximum temperature setting with a long endpoint label" }
];
const controls = computed(() => ({ min: 10, max: 110, disabled: disabled.value, invalid: invalid.value }));
const examples = [
  { key: "range", range: true, marks: [], label: "Plain range" },
  { key: "marked-range", range: true, marks, label: "Marked range" },
  { key: "marked-single", range: false, marks, label: "Marked single" },
  { key: "long-marks", range: true, marks: longMarks, label: "Long marked range" },
  { key: "bare-single", range: false, marks: [], label: "Bare single" }
];
function reset(): void {
  single.value = 50;
  range.value = [30, 90];
}
</script>

<template>
  <section class="slider-geometry-fixture" data-testid="slider-geometry-fixture">
    <div class="slider-geometry-controls">
      <label><input v-model="disabled" type="checkbox" /> Disabled sliders</label>
      <label><input v-model="invalid" type="checkbox" /> Invalid sliders</label>
      <label><input v-model="customTokens" type="checkbox" /> Custom slider tokens</label>
      <label><input v-model="fluid" type="checkbox" /> Fluid sliders</label>
      <button type="button" @click="reset">Reset slider values</button>
      <output data-testid="geometry-single-value" aria-label="Single value">{{ single }}</output>
      <output data-testid="geometry-range-value" aria-label="Range value">{{ range.join(',') }}</output>
    </div>
    <div
      class="slider-geometry-canvas"
      :class="{ 'wl-fluid': fluid }"
      :style="customTokens ? { '--wl-slider-thumb': '26px', '--wl-slider-height': '10px' } : undefined"
      data-testid="slider-geometry-canvas"
    >
      <div
        v-for="example in examples"
        :key="example.key"
        class="slider-geometry-case"
        :class="{ 'slider-geometry-bare': example.key === 'bare-single' }"
        :data-slider-case="example.key"
      >
        <WlSlider
          v-if="example.range"
          v-model="range"
          v-bind="controls"
          range
          :marks="example.marks"
          :aria-label="example.label"
        />
        <WlSlider
          v-else
          v-model="single"
          v-bind="controls"
          :marks="example.marks"
          :aria-label="example.label"
        />
        <button v-if="example.key !== 'bare-single'" type="button" data-after-slider>After {{ example.label }}</button>
      </div>
    </div>
  </section>
</template>

<style>
@import "gavia-ui/styles/primitives.css";
</style>

<style scoped>
.slider-geometry-fixture { padding: 24px; }
.slider-geometry-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
.slider-geometry-canvas { width: 960px; max-width: 100%; }
.slider-geometry-case { margin-block: 20px; }
.slider-geometry-bare { padding-block: 12px; }
</style>
