<script setup lang="ts">
import type { WlDensity, WlSizeSm } from "gavia-ui";
import { WlSlider } from "gavia-ui";
import { ref } from "vue";

const single = ref(50);
const range = ref<[number, number]>([30, 90]);
const size = ref<WlSizeSm>("md");
const density = ref<WlDensity>("default");
const disabled = ref(false);
const invalid = ref(false);
const customTokens = ref(false);
const fluid = ref(true);
const marks = [10, 35, 60, 85, 110];
const longMarks = [
  { value: 10, label: "Minimum temperature setting with a long endpoint label" },
  { value: 110, label: "Maximum temperature setting with a long endpoint label" }
];
function reset(): void {
  single.value = 50;
  range.value = [30, 90];
}
</script>

<template>
  <section
    class="slider-geometry-fixture"
    data-testid="slider-geometry-fixture"
    :data-size="size"
    :data-density="density"
  >
    <div class="slider-geometry-controls">
      <label for="slider-geometry-size">Slider size</label>
      <select id="slider-geometry-size" v-model="size"><option>sm</option><option>md</option></select>
      <label for="slider-geometry-density">Slider density</label>
      <select id="slider-geometry-density" v-model="density"><option>default</option><option>compact</option></select>
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
      <div class="slider-geometry-case" data-slider-case="range">
        <WlSlider
          v-model="range"
          range
          :min="10"
          :max="110"
          :size="size"
          :density="density"
          :disabled="disabled"
          :invalid="invalid"
          aria-label="Plain range"
        />
        <button type="button" data-after-slider>After plain range</button>
      </div>
      <div class="slider-geometry-case" data-slider-case="marked-range">
        <WlSlider
          v-model="range"
          range
          :marks="marks"
          :min="10"
          :max="110"
          :size="size"
          :density="density"
          :disabled="disabled"
          :invalid="invalid"
          aria-label="Marked range"
        />
        <button type="button" data-after-slider>After marked range</button>
      </div>
      <div class="slider-geometry-case" data-slider-case="marked-single">
        <WlSlider
          v-model="single"
          :marks="marks"
          :min="10"
          :max="110"
          :size="size"
          :density="density"
          :disabled="disabled"
          :invalid="invalid"
          aria-label="Marked single"
        />
        <button type="button" data-after-slider>After marked single</button>
      </div>
      <div class="slider-geometry-case" data-slider-case="long-marks">
        <WlSlider
          v-model="range"
          range
          :marks="longMarks"
          :min="10"
          :max="110"
          :size="size"
          :density="density"
          :disabled="disabled"
          :invalid="invalid"
          aria-label="Long marked range"
        />
        <button type="button" data-after-slider>After long marked range</button>
      </div>
      <div class="slider-geometry-case slider-geometry-bare" data-slider-case="bare-single">
        <WlSlider
          v-model="single"
          :min="10"
          :max="110"
          :size="size"
          :density="density"
          :disabled="disabled"
          :invalid="invalid"
          aria-label="Bare single"
        />
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
