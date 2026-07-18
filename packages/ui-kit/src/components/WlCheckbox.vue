<script setup lang="ts">
import { computed } from "vue";
import Checkbox from "primevue/checkbox";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    indeterminate?: boolean;
    invalid?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    disabled: false,
    indeterminate: false,
    invalid: false
  }
);

const model = defineModel<boolean>({ default: false });

const rootClass = computed(() => [
  "wl-checkbox",
  props.indeterminate && "is-indeterminate",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <label class="wl-checkline" :class="{ 'is-disabled': disabled }" data-wl="checkbox">
    <Checkbox
      v-model="model"
      :binary="true"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :invalid="invalid"
      :pt="pt"
      :class="rootClass"
    />
    <span v-if="$slots.default" class="wl-checkline__label"><slot /></span>
  </label>
</template>
