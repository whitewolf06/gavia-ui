<script setup lang="ts">
import { ref } from "vue";
import { WlAutocomplete, WlCheckbox, WlDatePicker, WlFilePicker, WlFileUpload, WlInput, WlMultiSelect, WlNumberInput, WlPasswordInput, WlRadio, WlSegmented, WlSelect, WlSlider, WlSwitch, WlTextarea, WlTimePicker } from "../../src";
const text = ref("");
const amount = ref(1);
const flag = ref(false);
const time = ref<string | null>(null);
const date = ref<string | null>(null);
const option = ref<string | null>(null);
const options: readonly string[] = ["one", "two"];
const selected = ref<string[]>([]);
const files = ref<File[]>([]);
const segment = ref<"one" | "two" | null>(null);
const segments = [{ label: "One", value: "one" }, { label: "Two", value: "two" }] as const;
</script>

<template>
  <WlInput v-model.trim="text" />
  <WlPasswordInput v-model.trim="text" />
  <WlTextarea v-model.trim="text" />
  <WlSelect v-model="option" :options="options" />
  <WlMultiSelect v-model="selected" :options="options" />
  <WlAutocomplete v-model="option" :suggestions="options" />
  <WlFilePicker>
    <template #trigger="{ choose, clear, disabled, attrs }">
      <button v-bind="attrs" :disabled="disabled" @click="choose">Choose</button>
      <button @click="clear">Clear</button>
      <!-- @vue-expect-error The public trigger method does not accept arbitrary arguments. -->
      <button @click="choose('invalid')">Invalid</button>
    </template>
  </WlFilePicker>
  <!-- @vue-expect-error Numeric transforms violate the text model payload. -->
  <WlInput v-model.number="text" />
  <!-- @vue-expect-error Lazy is not a supported text component modifier. -->
  <WlInput v-model.lazy="text" />
  <!-- @vue-expect-error Password supports trim only. -->
  <WlPasswordInput v-model.number="text" />
  <!-- @vue-expect-error Textarea supports trim only. -->
  <WlTextarea v-model.lazy="text" />
  <!-- @vue-expect-error NumberInput exposes an unmodified numeric domain model. -->
  <WlNumberInput v-model.number="amount" />
  <!-- @vue-expect-error Slider does not support text modifiers. -->
  <WlSlider v-model.trim="amount" />
  <!-- @vue-expect-error HH:mm must not become a number. -->
  <WlTimePicker v-model.number="time" />
  <!-- @vue-expect-error Boolean models do not support lazy. -->
  <WlCheckbox v-model.lazy="flag" />
  <!-- @vue-expect-error Boolean models do not support trim. -->
  <WlSwitch v-model.trim="flag" />
  <!-- @vue-expect-error Radio keeps its exact selected value. -->
  <WlRadio v-model.number="text" value="one" />
  <!-- @vue-expect-error Select cannot transform the option domain. -->
  <WlSelect v-model.number="option" :options="options" />
  <!-- @vue-expect-error An array must remain an array. -->
  <WlMultiSelect v-model.number="selected" :options="options" />
  <!-- @vue-expect-error Autocomplete does not implement lazy semantics. -->
  <WlAutocomplete v-model.lazy="option" :suggestions="options" />
  <!-- @vue-expect-error ISO dates do not support numeric transforms. -->
  <WlDatePicker v-model.number="date" />
  <!-- @vue-expect-error File arrays do not support built-in modifiers. -->
  <WlFileUpload v-model.trim="files" />
  <!-- @vue-expect-error Segmented preserves exact option keys. -->
  <WlSegmented v-model.trim="segment" :options="segments" />
</template>
