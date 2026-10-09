<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlColorPicker } from "../../../../../../packages/ui-kit/src";
const color = ref("#2563eb");
const swatches = ["#2563eb", "#2e9e68", "#bf8615", "#d2494f", "#22252b", "#f7f7f8"];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlColorPicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.custom_palette_sizes_and_hex_0669") }}</h4>
      <div class="wl-grid" data-space="lg">
        <div v-for="size in ['sm', 'md'] as const" :key="size" class="wl-stack" data-space="sm"><p class="wl-text-small">{{ t("examples.palette_0670") }} {{ size }}</p><WlColorPicker v-model="color" :size="size" :swatches="swatches" :palette-label="`${t('examples.material_color_0671')}${size}`" :input-label="`${t('examples.material_color_hex_0672')}${size}`" /></div>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.rgb_and_rrggbb_input_is_normalized_to_lowercase_rrggbb_invalid_0673") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.external_error_and_disabled_0674") }}</h4>
      <div class="wl-grid" data-space="lg">
        <div class="wl-stack" data-space="sm" role="group" :aria-label="t('examples.color_with_an_external_error_0675')" aria-describedby="docs-color-error"><WlColorPicker v-model="color" :swatches="swatches" invalid :palette-label="t('examples.palette_with_an_error_0676')" :input-label="t('examples.hex_with_an_error_0677')" /><p id="docs-color-error" class="wl-text-small" role="alert">{{ t("examples.approve_the_selected_color_before_saving_0678") }}</p></div>
        <div class="wl-stack" data-space="sm"><p class="wl-text-small">{{ t("examples.unavailable_color_0679") }}</p><WlColorPicker model-value="#2e9e68" :swatches="swatches" disabled :palette-label="t('examples.unavailable_palette_0680')" :input-label="t('examples.unavailable_hex_0681')" /></div>
      </div>
      <div class="wl-inline" data-space="sm"><span class="docs-color-preview" :style="{ backgroundColor: color }" aria-hidden="true" /><WlButton size="sm" @click="color = '#2563eb'">{{ t("examples.reset_color_0682") }}</WlButton></div>
      <p class="wl-text-small" role="status">{{ t("examples.model_value_0683") }} {{ color }}.</p>
    </section>
  </div>
</template>

<style scoped>
.docs-color-preview { width: var(--wl-space-xl); height: var(--wl-space-xl); border: 1px solid var(--wl-border); border-radius: var(--wl-radius-sm); }
</style>