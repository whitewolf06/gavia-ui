<script setup lang="ts">
import { computed, useId } from "vue";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    id?: string;
  }>(),
  {
    required: false
  }
);

const uid = useId();
const controlId = computed(() => props.id ?? `wl-field-${uid}`);
const descId = computed(() => `${controlId.value}-desc`);
const hasDesc = computed(() => Boolean(props.error || props.hint));
</script>

<template>
  <div class="wl-field" :class="{ 'is-invalid': Boolean(error) }" data-wl="field">
    <label v-if="label" class="wl-field__label" :for="controlId">
      {{ label }}
      <span v-if="required" class="wl-field__req" aria-hidden="true">*</span>
    </label>
    <slot
      v-bind="{
        id: controlId,
        inputId: controlId,
        ariaDescribedby: hasDesc ? descId : undefined,
        ariaInvalid: error ? true : undefined,
        invalid: Boolean(error),
        required
      }"
    />
    <span v-if="error" :id="descId" class="wl-field__err" role="alert">
      <WlIcon name="warn" :size="12" />
      {{ error }}
    </span>
    <span v-else-if="hint" :id="descId" class="wl-field__hint">{{ hint }}</span>
  </div>
</template>
