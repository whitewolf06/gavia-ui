<script setup lang="ts">
import { computed, useAttrs } from "vue";
import DatePicker from "primevue/datepicker";
import type { WlSizeSm } from "../types";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

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
    pt: undefined
  }
);

/** v-model — ISO "YYYY-MM-DD" string or null. */
const model = defineModel<string | null>({ default: null });
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));
const mergedPt = computed(() =>
  deepMerge({ pcInputText: { root: inputAttrs.value } }, props.pt)
);

const pad2 = (n: number): string => String(n).padStart(2, "0");

function parseIso(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null;
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

const inputClass = computed(() => [
  "wl-input",
  `wl-input--${props.size}`,
  props.invalid && "is-invalid",
  props.showIcon && "wl-dp__input--btn"
]);
</script>

<template>
  <DatePicker
    v-bind="rootAttrs"
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
    :inputId="controlProps.inputId"
    :name="controlProps.name"
    :required="controlProps.required"
    :readonly="controlProps.readonly"
    :ariaLabel="controlProps.ariaLabel"
    :ariaLabelledby="controlProps.ariaLabelledby"
    iconDisplay="button"
    :minDate="minDateObj"
    :maxDate="maxDateObj"
    :inputClass="inputClass"
    :pt="mergedPt"
  />
</template>
