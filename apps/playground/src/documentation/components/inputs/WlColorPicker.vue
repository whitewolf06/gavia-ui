<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlColorPicker } from "../../../../../../packages/ui-kit/src";
const color = ref("#2563eb");
const swatches = ["#2563eb", "#2e9e68", "#bf8615", "#d2494f", "#22252b", "#f7f7f8"];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlColorPicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Своя палитра, размеры и HEX</h4>
      <div class="wl-grid" data-space="lg">
        <div v-for="size in ['sm', 'md'] as const" :key="size" class="wl-stack" data-space="sm"><p class="wl-text-small">Палитра {{ size }}</p><WlColorPicker v-model="color" :size="size" :swatches="swatches" :palette-label="`Цвет материала, ${size}`" :input-label="`HEX цвета материала, ${size}`" /></div>
      </div>
      <p class="wl-text-small wl-text-muted">Ввод #rgb и #rrggbb нормализуется к #rrggbb в нижнем регистре. Ошибочный текст помечает поле, сохраняя последнее допустимое значение модели.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Внешняя ошибка и disabled</h4>
      <div class="wl-grid" data-space="lg">
        <div class="wl-stack" data-space="sm" role="group" aria-label="Цвет с внешней ошибкой" aria-describedby="docs-color-error"><WlColorPicker v-model="color" :swatches="swatches" invalid palette-label="Палитра с ошибкой" input-label="HEX с ошибкой" /><p id="docs-color-error" class="wl-text-small" role="alert">Согласуйте выбранный цвет перед сохранением.</p></div>
        <div class="wl-stack" data-space="sm"><p class="wl-text-small">Недоступный цвет</p><WlColorPicker model-value="#2e9e68" :swatches="swatches" disabled palette-label="Недоступная палитра" input-label="Недоступный HEX" /></div>
      </div>
      <div class="wl-inline" data-space="sm"><span class="docs-color-preview" :style="{ backgroundColor: color }" aria-hidden="true" /><WlButton size="sm" @click="color = '#2563eb'">Сбросить цвет</WlButton></div>
      <p class="wl-text-small" role="status">Значение модели: {{ color }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-color-preview { width: var(--wl-space-xl); height: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-radius-sm); }
</style>