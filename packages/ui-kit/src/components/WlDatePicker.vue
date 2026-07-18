<script setup lang="ts">
import { computed, watchEffect } from "vue";
import DatePicker from "primevue/datepicker";
import { usePrimeVue } from "primevue/config";
import { wlLocaleRu } from "../locale";
import type { WlDatePickerLocale, WlSizeSm } from "../types";

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    size?: WlSizeSm;
    disabled?: boolean;
    invalid?: boolean;
    showIcon?: boolean;
    /** ISO "YYYY-MM-DD". */
    minDate?: string;
    /** ISO "YYYY-MM-DD". */
    maxDate?: string;
    /**
     * PrimeVue 4 reads the calendar locale from the global config
     * ($primevue.config.locale), so this prop is merged into it —
     * assumes a single-locale app. Defaults to the kit Russian locale.
     */
    locale?: WlDatePickerLocale;
    pt?: Record<string, unknown>;
  }>(),
  {
    placeholder: "дд.мм.гггг",
    size: "md",
    disabled: false,
    invalid: false,
    showIcon: false,
    minDate: undefined,
    maxDate: undefined,
    locale: () => wlLocaleRu,
    pt: undefined
  }
);

/** v-model — ISO "YYYY-MM-DD" string or null. */
const model = defineModel<string | null>({ default: null });

const pad2 = (n: number): string => String(n).padStart(2, "0");

function parseIso(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toIso(date: Date | null): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/* PrimeVue works with Date objects; the kit exposes ISO strings. */
const dateValue = computed<Date | null>({
  get: () => parseIso(model.value),
  set: (d) => {
    model.value = toIso(d);
  }
});

const minDateObj = computed(() => parseIso(props.minDate) ?? undefined);
const maxDateObj = computed(() => parseIso(props.maxDate) ?? undefined);

const primevue = usePrimeVue();
watchEffect(() => {
  if (props.locale) {
    primevue.config.locale = {
      ...primevue.config.locale,
      ...props.locale
    } as typeof primevue.config.locale;
  }
});

const inputClass = computed(() => [
  "wl-input",
  `wl-input--${props.size}`,
  props.invalid && "is-invalid",
  props.showIcon && "wl-dp__input--btn"
]);
</script>

<template>
  <DatePicker
    v-model="dateValue"
    class="wl-dp"
    :data-size="size"
    data-wl="date-picker"
    selectionMode="single"
    dateFormat="dd.mm.yy"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :showIcon="showIcon"
    iconDisplay="button"
    :minDate="minDateObj"
    :maxDate="maxDateObj"
    :inputClass="inputClass"
    :pt="pt"
  />
</template>
