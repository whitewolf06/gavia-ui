<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlSlider } from "../../../../../../packages/ui-kit/src";
const volume = ref(40);
const interval = ref(20);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSlider">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.range_step_and_current_value_0830") }}</h4>
      <WlField id="docs-slider-volume" :label="t('examples.volume_0121')" :hint="t('examples.from_0_to_100_step_5_0831')" v-slot="{ id, ariaDescribedby }"><WlSlider :id="id" v-model="volume" :min="0" :max="100" :step="5" :aria-label="t('examples.volume_0121')" :aria-describedby="ariaDescribedby" /><output :for="id" class="wl-text-small">{{ volume }}%</output></WlField>
      <WlField id="docs-slider-interval" :label="t('examples.interval_minutes_0832')" :hint="t('examples.from_10_to_50_step_10_0833')" v-slot="{ id, ariaDescribedby }"><WlSlider :id="id" v-model="interval" :min="10" :max="50" :step="10" :aria-label="t('examples.interval_0834')" :aria-describedby="ariaDescribedby" /><output :for="id" class="wl-text-small">{{ interval }} {{ t("examples.minutes_0835") }}</output></WlField>
      <p class="wl-text-small wl-text-muted">{{ t("examples.arrow_keys_home_and_end_control_the_native_range_the_current_v_0836") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.unavailable_slider_0837") }}</h4>
      <WlField id="docs-slider-disabled" :label="t('examples.fixed_level_0838')" v-slot="{ id }"><WlSlider :id="id" :model-value="60" disabled :aria-label="t('examples.fixed_level_0838')" /><output :for="id" class="wl-text-small">60%</output></WlField>
      <WlButton size="sm" @click="volume = 40; interval = 20">{{ t("examples.reset_ranges_0839") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.volume_0122") }} {{ volume }}{{ t("examples.interval_0840") }} {{ interval }} {{ t("examples.minutes_0841") }}</p>
    </section>
  </div>
</template>