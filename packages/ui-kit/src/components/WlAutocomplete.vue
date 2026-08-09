<script setup lang="ts">
import { computed, useAttrs } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { WlDensity, WlSizeSm } from "../types";
import { getPrimeControlProps, splitInputAttrs } from "../utils/inputAttrs";
import { deepMerge } from "../utils/merge";

defineOptions({ inheritAttrs: false });

/** Событие поиска: обновите `suggestions` по `query`. */
export interface WlAutocompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

const props = withDefaults(
  defineProps<{
    suggestions?: unknown[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    optionLabel?: string | ((option: any) => string);
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    multiple?: boolean;
    dropdown?: boolean;
    dropdownLabel?: string;
    minLength?: number;
    pt?: Record<string, unknown>;
  }>(),
  {
    suggestions: () => [],
    invalid: false,
    disabled: false,
    size: "md",
    density: "default",
    multiple: false,
    dropdown: false,
    dropdownLabel: "Показать варианты",
    minLength: 1,
    pt: undefined
  }
);

const emit = defineEmits<{
  complete: [event: WlAutocompleteCompleteEvent];
}>();

const model = defineModel<unknown>();
const attrs = useAttrs();

const attrGroups = computed(() => splitInputAttrs(attrs));
const inputAttrs = computed(() => attrGroups.value.inputAttrs);
const rootAttrs = computed(() => attrGroups.value.rootAttrs);
const controlProps = computed(() => getPrimeControlProps(inputAttrs.value));

const rootClass = computed(() => [
  "wl-autocomplete",
  `wl-autocomplete--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);

const mergedPt = computed(() =>
  deepMerge(
    {
      pcInputText: { root: inputAttrs.value },
      input: inputAttrs.value,
      dropdown: {
        "aria-label": props.dropdownLabel
      }
    },
    props.pt
  )
);

/** В single-режиме инпут — обычное поле кита; в multiple — голый инпут внутри контейнера. */
const inputClass = computed(() =>
  props.multiple
    ? "wl-autocomplete__inner-input"
    : [
        "wl-input",
        `wl-input--${props.size}`,
        props.invalid && "is-invalid",
        props.density === "compact" && "is-compact"
      ]
);
</script>

<template>
  <AutoComplete
    v-bind="rootAttrs"
    v-model="model"
    :suggestions="suggestions"
    :optionLabel="optionLabel"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :multiple="multiple"
    :dropdown="dropdown"
    :minLength="minLength"
    :inputId="controlProps.inputId"
    :name="controlProps.name"
    :ariaLabel="controlProps.ariaLabel"
    :ariaLabelledby="controlProps.ariaLabelledby"
    :inputClass="inputClass"
    :pt="mergedPt"
    :class="rootClass"
    data-wl="autocomplete"
    :data-size="size"
    :data-density="density"
    @complete="emit('complete', $event)"
  />
</template>
