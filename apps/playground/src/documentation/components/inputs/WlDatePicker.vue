<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlDatePicker, WlField, type WlDateRange } from "../../../../../../packages/ui-kit/src";
const date = ref<string | null>("2026-10-15");
const period = ref<WlDateRange | null>(["2026-10-15", "2026-10-20"]);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlDatePicker">
    <section class="wl-stack" data-space="md" :aria-label="t('examples.date_format_and_limits_0684')">
      <h4 class="wl-heading-4">{{ t("examples.sizes_format_and_available_dates_0685") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-date-${size}`" :label="`${t('examples.meeting_date_0686')}${size}`" :hint="t('examples.dates_in_october_2026_0687')" v-slot="{ id, ariaDescribedby }"><WlDatePicker :id="id" v-model="date" :size="size" show-icon min-date="2026-10-01" max-date="2026-10-31" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-date-iso" :label="t('examples.manual_input_in_iso_format_0688')" :hint="t('examples.yyyy_mm_dd_the_model_always_remains_iso_0689')" v-slot="{ id, ariaDescribedby }"><WlDatePicker :id="id" v-model="date" display-format="yyyy-mm-dd" placeholder="YYYY-MM-DD" min-date="2026-10-01" max-date="2026-10-31" :aria-describedby="ariaDescribedby" /></WlField>
      </div>
      <p class="wl-body-sm wl-muted">{{ t("examples.arrowdown_opens_the_calendar_and_focuses_the_date_arrow_keys_m_0690") }}</p>
    </section>
    <section class="wl-stack" data-space="md" :aria-label="t('examples.date_range_0691')">
      <h4 class="wl-heading-4">{{ t("examples.range_from_start_to_end_0692") }}</h4>
      <WlField id="docs-date-range" :label="t('examples.travel_dates_0693')" :hint="t('examples.select_start_and_end_in_one_calendar_or_enter_dates_both_limit_0694')" :error="period && !period[1] ? t('examples.choose_a_trip_end_date_0695') : undefined" v-slot="{ id, ariaDescribedby, invalid }">
        <WlDatePicker :id="id" v-model="period" selection-mode="range" show-icon name="trip-date"
          :start-label="t('examples.from_0696')" :end-label="t('examples.to_0697')" min-date="2026-10-01" max-date="2026-10-31"
          :invalid="invalid" :aria-describedby="ariaDescribedby" data-testid="docs-date-range" />
      </WlField>
      <p class="wl-body-sm wl-muted">{{ t("examples.the_first_selection_stores_start_null_and_keeps_the_calendar_o_0698") }}</p>
      <div class="wl-inline" data-space="sm">
        <WlButton size="sm" @click="period = null">{{ t("examples.clear_range_0699") }}</WlButton>
        <WlButton size="sm" @click="period = ['2026-10-15', '2026-10-20']">{{ t("examples.restore_october_15_20_0700") }}</WlButton>
      </div>
      <output class="wl-body-sm" aria-live="polite" data-testid="docs-date-range-model">{{ t("examples.range_model_0701") }} {{ JSON.stringify(period) }}</output>
      <WlField id="docs-date-range-disabled" :label="t('examples.unavailable_range_0702')" v-slot="{ id }"><WlDatePicker :id="id" :model-value="['2026-10-15', '2026-10-20']" selection-mode="range" show-icon disabled /></WlField>
    </section>
    <section class="wl-stack" data-space="md" :aria-label="t('examples.date_error_and_clearing_0703')">
      <h4 class="wl-heading-4">{{ t("examples.error_disabled_and_clearing_0704") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-date-required" :label="t('examples.required_date_0705')" :error="date ? undefined : t('examples.choose_a_meeting_date_0706')" v-slot="{ id, ariaDescribedby, invalid }"><WlDatePicker :id="id" v-model="date" show-icon min-date="2026-10-01" max-date="2026-10-31" :invalid="invalid" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-date-disabled" :label="t('examples.unavailable_date_0707')" v-slot="{ id }"><WlDatePicker :id="id" model-value="2026-10-15" show-icon disabled /></WlField>
      </div>
      <div class="wl-inline" data-space="sm">
        <WlButton size="sm" @click="date = null">{{ t("examples.clear_date_0708") }}</WlButton>
        <WlButton size="sm" @click="date = '2026-10-15'">{{ t("examples.restore_october_15_0709") }}</WlButton>
      </div>
      <p class="wl-body-sm" role="status">{{ t("examples.iso_model_0710") }} {{ date ?? 'null' }}</p>
    </section>
  </div>
</template>
