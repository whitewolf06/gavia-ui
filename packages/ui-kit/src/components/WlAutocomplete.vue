<script setup lang="ts">
import { computed } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { WlDensity, WlSizeSm } from "../types";

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
    minLength: 1,
    pt: undefined
  }
);

const emit = defineEmits<{
  complete: [event: WlAutocompleteCompleteEvent];
}>();

const model = defineModel<unknown>();

const rootClass = computed(() => [
  "wl-autocomplete",
  `wl-autocomplete--${props.size}`,
  props.invalid && "is-invalid",
  props.disabled && "is-disabled",
  props.density === "compact" && "is-compact"
]);

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
    v-model="model"
    :suggestions="suggestions"
    :optionLabel="optionLabel"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :multiple="multiple"
    :dropdown="dropdown"
    :minLength="minLength"
    :inputClass="inputClass"
    :pt="pt"
    :class="rootClass"
    data-wl="autocomplete"
    :data-size="size"
    @complete="emit('complete', $event)"
  />
</template>
