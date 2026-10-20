<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const props = defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlDatePicker, type WlDatePickerSelectionMode, type WlDateRange } from "gavia-ui";
import { computed, ref } from "vue";
const selectionMode = computed<WlDatePickerSelectionMode>(() => props.preview?.selectionMode === "range" ? "range" : "single");
const forwardedPreview = computed(() => {
  const attributes = { ...props.preview };
  delete attributes.selectionMode;
  return attributes;
});
const single = ref<string | null>("2026-10-15");
const range = ref<WlDateRange | null>(["2026-10-15", "2026-10-20"]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDatePicker
      v-if="selectionMode === 'single'"
      v-model="single"
      selection-mode="single"
      show-icon
      min-date="2026-10-01"
      max-date="2026-10-31"
      display-format="locale"
      :format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
      :disabled-dates="['2026-10-18']"
      :aria-label="t('examples.date_in_october_0042')"
      v-bind="forwardedPreview"
    />
    <WlDatePicker
      v-else
      v-model="range"
      selection-mode="range"
      show-icon
      min-date="2026-10-01"
      max-date="2026-10-31"
      display-format="locale"
      :format-options="{ year: 'numeric', month: 'long', day: 'numeric' }"
      :disabled-dates="['2026-10-18']"
      :range-presets="[{ label: t('examples.week_0021'), value: ['2026-10-12', '2026-10-16'] }]"
      :aria-label="t('examples.dates_in_october_0043')"
      v-bind="forwardedPreview"
    />
    <p role="status">{{ selectionMode === 'range' ? JSON.stringify(range) : single ?? 'null' }}</p>
  </div>
</template>
