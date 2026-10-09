<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlTimePicker } from "../../../../../../packages/ui-kit/src";
const appointment = ref<string | null>("09:30");
const night = ref<string | null>("23:30");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlTimePicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.sizes_and_daytime_range_0873") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-time-${size}`" :label="`${t('examples.meeting_time_0874')}${size}`" :hint="t('examples.from_08_00_to_18_00_0875')" v-slot="{ id, ariaDescribedby }"><WlTimePicker :id="id" v-model="appointment" :size="size" min-time="08:00" max-time="18:00" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-compact" :label="t('examples.compact_time_0876')" v-slot="{ id }"><WlTimePicker :id="id" v-model="appointment" min-time="08:00" max-time="18:00" density="compact" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.overnight_range_error_and_disabled_0877") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-time-night" :label="t('examples.night_shift_0878')" :hint="t('examples.from_22_00_to_02_00_the_range_crosses_midnight_0879')" v-slot="{ id, ariaDescribedby }"><WlTimePicker :id="id" v-model="night" min-time="22:00" max-time="02:00" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-required" :label="t('examples.required_meeting_time_0880')" :error="appointment ? undefined : t('examples.enter_a_meeting_time_0881')" required v-slot="{ id, ariaDescribedby, invalid, required }"><WlTimePicker :id="id" v-model="appointment" min-time="08:00" max-time="18:00" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-disabled" :label="t('examples.unavailable_time_0882')" v-slot="{ id }"><WlTimePicker :id="id" model-value="10:00" disabled /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_model_is_hh_mm_or_null_without_a_date_or_time_zone_an_empt_0883") }}</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="appointment = null; night = null">{{ t("examples.clear_time_0884") }}</WlButton><WlButton size="sm" @click="appointment = '09:30'; night = '23:30'">{{ t("examples.reset_time_0885") }}</WlButton></div>
      <p class="wl-text-small" role="status">{{ t("examples.meeting_0886") }} {{ appointment ?? 'null' }}{{ t("examples.night_shift_0887") }} {{ night ?? 'null' }}.</p>
    </section>
  </div>
</template>