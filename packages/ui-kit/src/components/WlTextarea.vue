<script setup lang="ts">
import { computed } from "vue";
import Textarea from "primevue/textarea";

const props = withDefaults(
  defineProps<{
    invalid?: boolean;
    disabled?: boolean;
    rows?: number;
    autoResize?: boolean;
    placeholder?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    invalid: false,
    disabled: false,
    rows: 3,
    autoResize: false
  }
);

const model = defineModel<string>({ default: "" });

const rootClass = computed(() => [
  "wl-textarea",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <Textarea
    v-model="model"
    :class="rootClass"
    :rows="rows"
    :autoResize="autoResize"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :pt="pt"
    data-wl="textarea"
  />
</template>
