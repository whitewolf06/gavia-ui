<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlDensity, WlSizeSm } from "../types";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    size?: WlSizeSm;
    density?: WlDensity;
    invalid?: boolean;
    disabled?: boolean;
    placeholder?: string;
    ariaLabel?: string;
  }>(),
  {
    size: "md",
    density: "default",
    invalid: false,
    disabled: false,
    placeholder: "Пароль"
  }
);

const model = defineModel<string>({ default: "" });
const visible = ref(false);
const attrs = useAttrs();

const innerAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "id" || key.startsWith("aria-")) out[key] = value;
  }
  return out;
});

const rootAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== "id" && !key.startsWith("aria-")) out[key] = value;
  }
  return out;
});
</script>

<template>
  <div
    class="wl-input-wrap wl-input-wrap--has-btn"
    :class="{ 'is-disabled': disabled }"
    v-bind="rootAttrs"
    data-wl="password-input"
    :data-size="size"
  >
    <input
      v-model="model"
      class="wl-input"
      :class="[
        `wl-input--${size}`,
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        density === 'compact' && 'is-compact'
      ]"
      v-bind="innerAttrs"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
    />
    <button
      type="button"
      class="wl-input-wrap__btn"
      :disabled="disabled"
      :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <WlIcon :name="visible ? 'eye-off' : 'eye'" :size="13" />
    </button>
  </div>
</template>
