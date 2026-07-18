<script setup lang="ts">
import { computed } from "vue";
import RadioButton from "primevue/radiobutton";

const props = withDefaults(
  defineProps<{
    value: unknown;
    name?: string;
    disabled?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    disabled: false,
    invalid: false
  }
);

const model = defineModel<unknown>();

const rootClass = computed(() => [
  "wl-radio",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label class="wl-checkline wl-checkline--radio" :class="{ 'is-disabled': disabled }" data-wl="radio">
    <RadioButton
      v-model="model"
      :value="value"
      :name="name"
      :disabled="disabled"
      :invalid="invalid"
      :pt="pt"
      :class="rootClass"
    />
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
