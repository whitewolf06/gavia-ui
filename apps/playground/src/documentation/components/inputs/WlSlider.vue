<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlSlider } from "../../../../../../packages/ui-kit/src";
const volume = ref(40);
const interval = ref(20);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSlider">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Диапазон, шаг и текущее значение</h4>
      <WlField id="docs-slider-volume" label="Громкость" hint="От 0 до 100, шаг 5." v-slot="{ id, ariaDescribedby }"><WlSlider :id="id" v-model="volume" :min="0" :max="100" :step="5" aria-label="Громкость" :aria-describedby="ariaDescribedby" /><output :for="id" class="wl-text-small">{{ volume }}%</output></WlField>
      <WlField id="docs-slider-interval" label="Интервал, минуты" hint="От 10 до 50, шаг 10." v-slot="{ id, ariaDescribedby }"><WlSlider :id="id" v-model="interval" :min="10" :max="50" :step="10" aria-label="Интервал" :aria-describedby="ariaDescribedby" /><output :for="id" class="wl-text-small">{{ interval }} минут</output></WlField>
      <p class="wl-text-small wl-text-muted">Стрелки, Home и End управляют нативным range. Текущее значение показано числом рядом.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Недоступный слайдер</h4>
      <WlField id="docs-slider-disabled" label="Фиксированный уровень" v-slot="{ id }"><WlSlider :id="id" :model-value="60" disabled aria-label="Фиксированный уровень" /><output :for="id" class="wl-text-small">60%</output></WlField>
      <WlButton size="sm" @click="volume = 40; interval = 20">Сбросить диапазоны</WlButton>
      <p class="wl-text-small" role="status">Громкость: {{ volume }}%. Интервал: {{ interval }} минут.</p>
    </section>
  </div>
</template>